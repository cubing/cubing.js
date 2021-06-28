import { Alg } from "../../../cubing/alg";
import {
  KPuzzleDefinition,
  KPuzzle,
  identityTransformation,
  invertTransformation,
} from "../../../cubing/kpuzzle";

export interface SGSCachedData {
  baseorder: Array<Array<number>>;
  esgs: Array<any>; // TODO
}

export function parseSGS(def: KPuzzleDefinition, sgs: string): SGSCachedData {
  const baseorder: any = [];
  const esgs: any = []; // TODO
  /*
   *   Build an executable SGS from the set of algorithms we are given.
   */
  for (const line of sgs.split("\n")) {
    if (line.startsWith("SetOrder")) {
      var f = line.split(" ");
      for (var j = 2; j < f.length; j++) {
        baseorder[parseInt(f[j], 10) - 1] = [f[1], j - 2];
      }
    } else if (line.startsWith("Alg")) {
      var salgo = line.substring(4);
      var algo = Alg.fromString(salgo);
      const kpuzzle = new KPuzzle(def);
      kpuzzle.applyAlg(algo);
      const st = identityTransformation(def);
      const st2 = kpuzzle.state;
      var st2i = invertTransformation(def, st2);
      var loc = 0;
      while (loc < baseorder.length) {
        var set = baseorder[loc][0];
        var ind = baseorder[loc][1] as number; // TODO
        if (
          st[set].permutation[ind] !== st2[set].permutation[ind] ||
          st[set].orientation[ind] !== st2[set].orientation[ind]
        )
          break;
        loc++;
      }
      var set = baseorder[loc][0];
      var ind = baseorder[loc][1] as number;
      if (esgs[loc] === undefined) esgs[loc] = [];
      if (esgs[loc][st2i[set].permutation[ind]] === undefined)
        esgs[loc][st2i[set].permutation[ind]] = [];
      esgs[loc][st2i[set].permutation[ind]][st2i[set].orientation[ind]] = [
        algo.invert().toString(),
        st2i,
      ];
    } else if (line.length === 0) {
      // blank line
    } else {
      throw new Error(`Bad line in sgs: ${line}`);
    }
  }
  return { baseorder, esgs };
}
