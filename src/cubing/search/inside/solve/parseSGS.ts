import { Alg } from "../../../alg";
import {
  oldIdentityTransformation,
  oldInvertTransformation,
  OldKPuzzle,
  OldKPuzzleDefinition,
  OldTransformation,
} from "../../../kpuzzle";

interface PieceReference {
  orbitName: string;
  permutationIdx: number;
}

export interface SGSAction {
  alg: Alg;
  transformation: OldTransformation;
}

export interface SGSCachedData {
  ordering: {
    pieceOrdering: PieceReference[];
    lookup: Record<string, SGSAction>;
  }[];
}

export function parseSGS(
  def: OldKPuzzleDefinition,
  sgs: string,
): SGSCachedData {
  const subgroupSizes: number[] = [];
  const sgsActions: SGSAction[] = [];
  for (const line of sgs.split("\n")) {
    const lineTokens = line.split(" ");
    if (line.startsWith("SetOrder ")) {
      // ignore
    } else if (line.startsWith("Alg ")) {
      const alg = Alg.fromString(line.substring(4));
      const kpuzzle = new OldKPuzzle(def);
      kpuzzle.reset();
      kpuzzle.applyAlg(alg);
      sgsActions.push({ alg: alg, transformation: kpuzzle.state });
    } else if (line.startsWith("SubgroupSizes ")) {
      for (let j = 1; j < lineTokens.length; j++) {
        subgroupSizes.push(parseInt(lineTokens[j]));
      }
    }
  }

  const sgsCachedData: SGSCachedData = {
    ordering: new Array(subgroupSizes.length),
  };
  const subgroupAlgOffsets: number[] = [];
  let sum = 0;
  subgroupAlgOffsets.push(0);
  const emptyAlg = Alg.fromString("");
  const identity = oldIdentityTransformation(def);
  for (let i = 0; i < subgroupSizes.length; i++) {
    sum += subgroupSizes[i];
    subgroupAlgOffsets.push(sum);
    sgsActions.splice(sum - 1, 0, { alg: emptyAlg, transformation: identity });
  }
  if (sgsActions.length !== sum) {
    throw Error(
      `Bad sgs; expected ${sum - subgroupSizes.length} algs but saw ${
        sgsActions.length - subgroupSizes.length
      }`,
    );
  }
  const processedPieces: Record<string, boolean[]> = {};
  for (const orbitName in def.orbits) {
    const orbitDefinition = def.orbits[orbitName];
    processedPieces[orbitName] = new Array(orbitDefinition.numPieces).fill(
      false,
    );
  }
  for (let i = subgroupSizes.length - 1; i >= 0; i--) {
    const pieceOrdering: PieceReference[] = [];
    for (let j = subgroupAlgOffsets[i]; j < subgroupAlgOffsets[i + 1]; j++) {
      const transformation = sgsActions[j].transformation;
      for (const orbitName in def.orbits) {
        const orbitDefinition = def.orbits[orbitName];
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          if (
            transformation[orbitName].permutation[idx] !== idx ||
            transformation[orbitName].orientation[idx] !== 0
          ) {
            if (!processedPieces[orbitName][idx]) {
              pieceOrdering.push({ orbitName: orbitName, permutationIdx: idx });
              processedPieces[orbitName][idx] = true;
            }
          }
        }
      }
    }
    const lookup: Record<string, SGSAction> = {};
    for (let j = subgroupAlgOffsets[i]; j < subgroupAlgOffsets[i + 1]; j++) {
      const transformation = oldInvertTransformation(
        def,
        sgsActions[j].transformation,
      );
      let key = "";
      for (let k = 0; k < pieceOrdering.length; k++) {
        const loc = pieceOrdering[k];
        key = `${key} ${
          transformation[loc.orbitName].permutation[loc.permutationIdx]
        } ${transformation[loc.orbitName].orientation[loc.permutationIdx]}`;
      }
      lookup[key] = sgsActions[j];
      sgsActions[j].alg = sgsActions[j].alg.invert();
      sgsActions[j].transformation = oldInvertTransformation(
        def,
        sgsActions[j].transformation,
      );
    }
    sgsCachedData.ordering[i] = {
      pieceOrdering: pieceOrdering,
      lookup: lookup,
    };
  }
  return sgsCachedData;
}
