import { Alg } from "../../../alg";
import type { KPuzzle, KTransformation } from "../../../kpuzzle";

interface PieceReference {
  orbitName: string;
  permutationIdx: number;
}

export interface SGSAction {
  alg: Alg;
  transformation: KTransformation;
}

export interface SGSCachedData {
  ordering: {
    pieceOrdering: PieceReference[];
    lookup: Record<string, SGSAction>;
  }[];
}

export function parseSGS(kpuzzle: KPuzzle, sgs: string): SGSCachedData {
  const subgroupSizes: number[] = [];
  const sgsActions: SGSAction[] = [];
  for (const line of sgs.split("\n")) {
    const lineTokens = line.split(" ");
    if (line.startsWith("SetOrder ")) {
      // ignore
    } else if (line.startsWith("Alg ")) {
      const alg = Alg.fromString(line.substring(4));
      sgsActions.push({
        alg: alg,
        transformation: kpuzzle.algToTransformation(alg),
      });
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
  const identity = kpuzzle.identityTransformation();
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
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    processedPieces[orbitDefinition.orbitName] = new Array(
      orbitDefinition.numPieces,
    ).fill(false);
  }
  for (let i = subgroupSizes.length - 1; i >= 0; i--) {
    const pieceOrdering: PieceReference[] = [];
    for (let j = subgroupAlgOffsets[i]; j < subgroupAlgOffsets[i + 1]; j++) {
      const transformation = sgsActions[j].transformation;
      for (const orbitDefinition of kpuzzle.definition.orbits) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          if (
            transformation.transformationData[orbitDefinition.orbitName]
              .permutation[idx] !== idx ||
            transformation.transformationData[orbitDefinition.orbitName]
              .orientationDelta[idx] !== 0
          ) {
            if (!processedPieces[orbitDefinition.orbitName][idx]) {
              pieceOrdering.push({
                orbitName: orbitDefinition.orbitName,
                permutationIdx: idx,
              });
              processedPieces[orbitDefinition.orbitName][idx] = true;
            }
          }
        }
      }
    }
    const lookup: Record<string, SGSAction> = {};
    for (let j = subgroupAlgOffsets[i]; j < subgroupAlgOffsets[i + 1]; j++) {
      const transformation = sgsActions[j].transformation.invert();
      let key = "";
      for (let k = 0; k < pieceOrdering.length; k++) {
        const loc = pieceOrdering[k];
        key = `${key} ${
          transformation.transformationData[loc.orbitName].permutation[
            loc.permutationIdx
          ]
        } ${
          transformation.transformationData[loc.orbitName].orientationDelta[
            loc.permutationIdx
          ]
        }`;
      }
      lookup[key] = sgsActions[j];
      sgsActions[j].alg = sgsActions[j].alg.invert();
      sgsActions[j].transformation = sgsActions[j].transformation.invert();
    }
    sgsCachedData.ordering[i] = {
      pieceOrdering: pieceOrdering,
      lookup: lookup,
    };
  }
  return sgsCachedData;
}
