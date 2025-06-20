import {
  type Alg,
  type Commutator,
  type Conjugate,
  functionFromTraversal,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalDownUp,
} from "../alg";
import { combineTransformationData } from "./combine";
import type { KPuzzle } from "./KPuzzle";
import type {
  KPatternData,
  KPatternOrbitData,
  KPuzzleDefinition,
  KPuzzleOrbitDefinition,
  KTransformationData,
  KTransformationOrbitData,
} from "./KPuzzleDefinition";
import { KTransformation } from "./KTransformation";

export function isOrbitTransformationDataIdentityUncached(
  numOrientations: number,
  orbitTransformationData: KTransformationOrbitData,
): boolean {
  // TODO
  // if (o === lasto) {
  //   return true;
  // }
  if (!orbitTransformationData.permutation) {
    console.log(orbitTransformationData);
  }
  const { permutation } = orbitTransformationData;
  const numPieces = permutation.length;
  for (let idx = 0; idx < numPieces; idx++) {
    if (permutation[idx] !== idx) {
      return false;
    }
  }
  if (numOrientations > 1) {
    const { orientationDelta: orientation } = orbitTransformationData;
    for (let idx = 0; idx < numPieces; idx++) {
      if (orientation[idx] !== 0) {
        return false;
      }
    }
  }
  // lasto = o; // TODO
  return true;
}

export function isOrbitTransformationDataIdentical(
  orbitDefinition: KPuzzleOrbitDefinition,
  orbitTransformationData1: KTransformationOrbitData,
  orbitTransformationData2: KTransformationOrbitData,
  options: {
    ignorePieceOrientations?: boolean;
    ignorePiecePermutation?: boolean;
  } = {},
): boolean {
  for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
    if (
      !options?.ignorePieceOrientations &&
      orbitTransformationData1.orientationDelta[idx] !==
        orbitTransformationData2.orientationDelta[idx]
    ) {
      return false;
    }
    if (
      !options?.ignorePiecePermutation &&
      orbitTransformationData1.permutation[idx] !==
        orbitTransformationData2.permutation[idx]
    ) {
      return false;
    }
  }
  return true;
}

export function isTransformationDataIdentical(
  kpuzzle: KPuzzle,
  transformationData1: KTransformationData,
  transformationData2: KTransformationData,
): boolean {
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    if (
      !isOrbitTransformationDataIdentical(
        orbitDefinition,
        transformationData1[orbitDefinition.orbitName],
        transformationData2[orbitDefinition.orbitName],
      )
    ) {
      return false;
    }
  }
  return true;
}

function isOrbitPatternDataIdentical(
  orbitDefinition: KPuzzleOrbitDefinition,
  orbitPatternData1: KPatternOrbitData,
  orbitPatternData2: KPatternOrbitData,
  options: {
    ignorePieceOrientations?: boolean;
    ignorePieceIndices?: boolean;
  } = {},
): boolean {
  for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
    if (
      !options?.ignorePieceOrientations &&
      (orbitPatternData1.orientation[idx] !==
        orbitPatternData2.orientation[idx] ||
        (orbitPatternData1.orientationMod?.[idx] ?? 0) !==
          (orbitPatternData2.orientationMod?.[idx] ?? 0))
    ) {
      return false;
    }
    if (
      !options?.ignorePieceIndices &&
      orbitPatternData1.pieces[idx] !== orbitPatternData2.pieces[idx]
    ) {
      return false;
    }
  }
  return true;
}

export function isPatternDataIdentical(
  kpuzzle: KPuzzle,
  patternData1: KPatternData,
  patternData2: KPatternData,
): boolean {
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    if (
      !isOrbitPatternDataIdentical(
        orbitDefinition,
        patternData1[orbitDefinition.orbitName],
        patternData2[orbitDefinition.orbitName],
      )
    ) {
      return false;
    }
  }
  return true;
}

export function invertTransformation(
  kpuzzle: KPuzzle,
  transformationData: KTransformationData,
): KTransformationData {
  const newTransformationData: KTransformationData = {};
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    const orbitTransformationData =
      transformationData[orbitDefinition.orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        orbitTransformationData,
      )
    ) {
      newTransformationData[orbitDefinition.orbitName] =
        orbitTransformationData;
    } else if (orbitDefinition.numOrientations === 1) {
      const newPerm = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        newPerm[orbitTransformationData.permutation[idx]] = idx;
      }
      newTransformationData[orbitDefinition.orbitName] = {
        permutation: newPerm,
        orientationDelta: orbitTransformationData.orientationDelta,
      };
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      const newOri = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        const fromIdx = orbitTransformationData.permutation[idx];
        newPerm[fromIdx] = idx;
        newOri[fromIdx] =
          (orbitDefinition.numOrientations -
            orbitTransformationData.orientationDelta[idx] +
            orbitDefinition.numOrientations) %
          orbitDefinition.numOrientations;
      }
      newTransformationData[orbitDefinition.orbitName] = {
        permutation: newPerm,
        orientationDelta: newOri,
      };
    }
  }
  return newTransformationData;
}

export function repeatTransformationUncached(
  kpuzzle: KPuzzle,
  transformationData: KTransformationData,
  amount: number,
): KTransformationData {
  // This is used for move construction, so we optimize for the quantum move case.
  if (amount === 1) {
    return transformationData;
  }
  if (amount < 0) {
    return repeatTransformationUncached(
      kpuzzle,
      invertTransformation(kpuzzle, transformationData),
      -amount,
    );
  }
  if (amount === 0) {
    // TODO
    const { transformationData } = kpuzzle.identityTransformation();
    return transformationData;
  }
  let halfish = transformationData;
  if (amount !== 2) {
    halfish = repeatTransformationUncached(
      kpuzzle,
      transformationData,
      Math.floor(amount / 2),
    );
  }
  const twiceHalfish = combineTransformationData(
    kpuzzle.definition,
    halfish,
    halfish,
  );
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return combineTransformationData(
      kpuzzle.definition,
      transformationData,
      twiceHalfish,
    );
  }
}

class AlgToTransformationTraversal extends TraversalDownUp<
  KPuzzle,
  KTransformation
> {
  traverseAlg(alg: Alg, kpuzzle: KPuzzle): KTransformation {
    let transformation: KTransformation | null = null;
    for (const algNode of alg.childAlgNodes()) {
      if (transformation) {
        transformation = transformation.applyTransformation(
          this.traverseAlgNode(algNode, kpuzzle),
        );
      } else {
        transformation = this.traverseAlgNode(algNode, kpuzzle);
      }
    }
    return transformation ?? kpuzzle.identityTransformation();
  }
  traverseGrouping(grouping: Grouping, kpuzzle: KPuzzle): KTransformation {
    const algTransformation = this.traverseAlg(grouping.alg, kpuzzle);
    return new KTransformation(
      kpuzzle,
      repeatTransformationUncached(
        kpuzzle,
        algTransformation.transformationData,
        grouping.amount,
      ),
    );
  }
  traverseMove(move: Move, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.moveToTransformation(move);
  }
  traverseCommutator(
    commutator: Commutator,
    kpuzzle: KPuzzle,
  ): KTransformation {
    const aTransformation = this.traverseAlg(commutator.A, kpuzzle);
    const bTransformation = this.traverseAlg(commutator.B, kpuzzle);
    return aTransformation
      .applyTransformation(bTransformation)
      .applyTransformation(aTransformation.invert())
      .applyTransformation(bTransformation.invert());
  }
  traverseConjugate(conjugate: Conjugate, kpuzzle: KPuzzle): KTransformation {
    const aTransformation = this.traverseAlg(conjugate.A, kpuzzle);
    const bTransformation = this.traverseAlg(conjugate.B, kpuzzle);
    return aTransformation
      .applyTransformation(bTransformation)
      .applyTransformation(aTransformation.invert());
  }
  traversePause(_: Pause, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.identityTransformation();
  }
  traverseNewline(_: Newline, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.identityTransformation();
  }
  traverseLineComment(_: LineComment, kpuzzle: KPuzzle): KTransformation {
    return kpuzzle.identityTransformation();
  }
}

export const algToTransformation = functionFromTraversal(
  AlgToTransformationTraversal,
);

// export function canConvertDefaultPatternToUniqueTransformationUncached(
//   definition: KPuzzleDefinition,
// ): boolean {
//   for (const orbitDefinition of definition.orbits) {
//     const pieces = new Array(orbitDefinition.numPieces).fill(false);
//     for (const piece of definition.defaultPattern[orbitDefinition.orbitName]
//       .pieces) {
//       pieces[piece] = true;
//     }
//     for (const piece of pieces) {
//       if (!piece) {
//         return false;
//       }
//     }
//   }
//   return true;
// }

function gcd(a: number, b: number): number {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}

/* calculate the order of a particular transformation. */
export function transformationRepetitionOrder(
  definition: KPuzzleDefinition,
  transformation: KTransformation,
): number {
  let order: number = 1;
  for (const orbitDefinition of definition.orbits) {
    const transformationOrbit =
      transformation.transformationData[orbitDefinition.orbitName];
    const orbitPieces = new Array(orbitDefinition.numPieces);
    for (let startIdx = 0; startIdx < orbitDefinition.numPieces; startIdx++) {
      if (!orbitPieces[startIdx]) {
        let currentIdx = startIdx;
        let orientationSum = 0;
        let cycleLength = 0;
        for (;;) {
          orbitPieces[currentIdx] = true;
          orientationSum =
            orientationSum + transformationOrbit.orientationDelta[currentIdx];
          cycleLength = cycleLength + 1;
          currentIdx = transformationOrbit.permutation[currentIdx];
          if (currentIdx === startIdx) {
            break;
          }
        }
        if (orientationSum !== 0) {
          cycleLength =
            (cycleLength * orbitDefinition.numOrientations) /
            gcd(orbitDefinition.numOrientations, Math.abs(orientationSum));
        }
        order = (order * cycleLength) / gcd(order, cycleLength);
      }
    }
  }
  return order;
}
