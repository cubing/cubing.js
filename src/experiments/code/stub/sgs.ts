import { Alg } from "../../../cubing/alg";
import {
  KPuzzleDefinition,
  KPuzzle,
  identityTransformation,
  invertTransformation,
} from "../../../cubing/kpuzzle";
import type { Transformation } from "../../../cubing/puzzle-geometry/interfaces";

export interface SGSCachedData {
  baseorder: Array<[string, number]>;
  esgs: Array<any>; // TODO
}

export function parseSGS(def: KPuzzleDefinition, sgs: string): SGSCachedData {
  const baseorder: Array<[string, number]> = [];
  const esgs: [string, Transformation][][][] = []; // TODO
  /*
   *   Build an executable SGS from the set of algorithms we are given.
   */
  for (const line of sgs.split("\n")) {
    if (line.startsWith("SetOrder")) {
      var f = line.split(" ");
      for (var j = 2; j < f.length; j++) {
        baseorder[parseInt(f[j], 10) - 1] = [f[1], j - 2];
      }
    } else if (line.startsWith("Alg ")) {
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
        var ind = baseorder[loc][1];
        console.log(
          ind,
          "asd",
          st[set].permutation[ind],
          st2[set].permutation[ind],
          st[set].orientation[ind],
          st2[set].orientation[ind],
          "st",
          JSON.stringify(st),
          JSON.stringify(st2),
          algo.toString(),
        );
        if (
          ind !== st2[set].permutation[ind] ||
          0 !== st2[set].orientation[ind]
        )
          break;
        loc++;
      }
      // console.log(st, st2, loc);
      var set = baseorder[loc][0];
      var ind = baseorder[loc][1];
      if (esgs[loc] === undefined) esgs[loc] = [];
      const l2 = st2i[set].permutation[ind];
      const l3 = st2i[set].orientation[ind];
      if (esgs[loc][l2] === undefined) esgs[loc][l2] = [];
      esgs[loc][l2][l3] = [algo.invert().toString(), st2i];
      console.log(loc, l2, l3);
    } else if (line.length === 0) {
      // blank line
    } else {
      throw new Error(`Bad line in sgs: ${line}`);
    }
  }
  return { baseorder, esgs };
}
