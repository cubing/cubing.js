import { Alg } from "../../../alg";
import {
  identityTransformation,
  invertTransformation,
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../kpuzzle";

interface PieceRef {
  orbitName: string;
  permutationIdx: number;
}

export interface SGSAction {
  alg: Alg;
  trans: Transformation;
}

export interface SGSCachedData {
  ordering: {
    cubieSeq: PieceRef[];
    lookup: Record<string, SGSAction>;
  }[];
}

export function parseSGS(def: KPuzzleDefinition, sgs: string): SGSCachedData {
  const subgroupSizes: number[] = [];
  const sgsActions: SGSAction[] = [];
  for (const line of sgs.split("\n")) {
    const lineTokens = line.split(" ");
    if (line.startsWith("SetOrder ")) {
      // ignore
    } else if (line.startsWith("Alg ")) {
      const alg = Alg.fromString(line.substring(4));
      const kpuzzle = new KPuzzle(def);
      kpuzzle.reset();
      kpuzzle.applyAlg(alg);
      sgsActions.push({alg: alg, trans: kpuzzle.state});
    } else if (line.startsWith("SubgroupSizes ")) {
      for (var j = 1; j < lineTokens.length; j++) {
        subgroupSizes.push(parseInt(lineTokens[j]));
      }
    }
  }

  const sgscd: SGSCachedData = {ordering:new Array(subgroupSizes.length)};
  const subgroupAlgsStart: number[] = [];
  let sum = 0;
  subgroupAlgsStart.push(0);
  const emptyAlg = Alg.fromString("");
  const identity = identityTransformation(def);
  for (let i=0; i<subgroupSizes.length; i++) {
    sum += subgroupSizes[i];
    subgroupAlgsStart.push(sum);
    sgsActions.splice(sum-1, 0, {alg: emptyAlg, trans: identity});
  }
  if (sgsActions.length !== sum) {
    throw Error("Bad sgs; expected " + (sum - subgroupSizes.length) + " algs but saw " + (sgsActions.length - subgroupSizes.length));
  }
  const cubieState: Record<string, boolean[]> = {};
  for (const orbitName in def.orbits) {
    const oDef = def.orbits[orbitName];
    cubieState[orbitName] = new Array(oDef.numPieces).fill(false);
  }
  for (let i=subgroupSizes.length-1; i>=0; i--) {
    const cubieSeq: PieceRef[] = [];
    for (let j=subgroupAlgsStart[i]; j<subgroupAlgsStart[i+1]; j++) {
      const trans = sgsActions[j].trans;
      for (const orbitName in def.orbits) {
        const oDef = def.orbits[orbitName];
        for (let idx = 0; idx < oDef.numPieces; idx++) {
          if (trans[orbitName].permutation[idx] !== idx || trans[orbitName].orientation[idx] !== 0) {
            if (!cubieState[orbitName][idx]) {
              cubieSeq.push({orbitName: orbitName, permutationIdx: idx});
              cubieState[orbitName][idx] = true;
            }
          }
        }
      }
    }
    const lookup: Record<string, SGSAction> = {};
    for (let j=subgroupAlgsStart[i]; j<subgroupAlgsStart[i+1]; j++) {
      const trans = invertTransformation(def, sgsActions[j].trans);
      let key = "";
      for (let k=0; k<cubieSeq.length; k++) {
        const loc = cubieSeq[k];
        key = key + " " + trans[loc.orbitName].permutation[loc.permutationIdx] + " " + trans[loc.orbitName].orientation[loc.permutationIdx];
      }
      lookup[key] = sgsActions[j];
      sgsActions[j].alg = sgsActions[j].alg.invert();
      sgsActions[j].trans = invertTransformation(def, sgsActions[j].trans);
    }
    sgscd.ordering[i] = {cubieSeq: cubieSeq, lookup: lookup};
  }
  return sgscd;
}
