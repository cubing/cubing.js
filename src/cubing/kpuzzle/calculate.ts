import type { KPuzzleDefinition } from ".";
import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
} from "../alg";
import { combineTransformationData } from "./combine";
import type { KPuzzle } from "./KPuzzle";
import type {
  KOrbitDefinition,
  KTransformationOrbitData,
  KTransformationData,
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
  const { permutation } = orbitTransformationData;
  const numPieces = permutation.length;
  for (let idx = 0; idx < numPieces; idx++) {
    if (permutation[idx] !== idx) {
      return false;
    }
  }
  if (numOrientations > 1) {
    const { orientation } = orbitTransformationData;
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
  orbitDefinition: KOrbitDefinition,
  orbitTransformationData1: KTransformationOrbitData,
  orbitTransformationData2: KTransformationOrbitData,
  options: {
    ignoreOrientation?: boolean;
    ignorePermutation?: boolean;
  } = {},
): boolean {
  for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
    if (
      !options?.ignoreOrientation &&
      orbitTransformationData1.orientation[idx] !==
        orbitTransformationData2.orientation[idx]
    ) {
      return false;
    }
    if (
      !options?.ignorePermutation &&
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
  for (const [orbitName, orbitDefinition] of Object.entries(
    kpuzzle.definition.orbits,
  )) {
    if (
      !isOrbitTransformationDataIdentical(
        orbitDefinition,
        transformationData1[orbitName],
        transformationData2[orbitName],
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
  for (const orbitName in kpuzzle.definition.orbits) {
    const orbitDefinition: KOrbitDefinition =
      kpuzzle.definition.orbits[orbitName];
    const orbitTransformationData = transformationData[orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.orientations,
        orbitTransformationData,
      )
    ) {
      newTransformationData[orbitName] = orbitTransformationData;
    } else if (orbitDefinition.orientations === 1) {
      const newPerm = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        newPerm[orbitTransformationData.permutation[idx]] = idx;
      }
      newTransformationData[orbitName] = {
        permutation: newPerm,
        orientation: orbitTransformationData.orientation,
      };
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      const newOri = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        const fromIdx = orbitTransformationData.permutation[idx];
        newPerm[fromIdx] = idx;
        newOri[fromIdx] =
          (orbitDefinition.orientations -
            orbitTransformationData.orientation[idx] +
            orbitDefinition.orientations) %
          orbitDefinition.orientations;
      }
      newTransformationData[orbitName] = {
        permutation: newPerm,
        orientation: newOri,
      };
    }
  }
  return newTransformationData;
}

export function selfMultiplyTransformationUncached(
  kpuzzle: KPuzzle,
  transformationData: KTransformationData,
  amount: number,
): KTransformationData {
  // This is used for move construction, so we optimize for the quantum move case.
  if (amount === 1) {
    return transformationData;
  }
  if (amount < 0) {
    return selfMultiplyTransformationUncached(
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
    halfish = selfMultiplyTransformationUncached(
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
    let transformation = kpuzzle.identityTransformation();
    for (const unit of alg.units()) {
      transformation = transformation.applyTransformation(
        this.traverseUnit(unit, kpuzzle),
      );
    }
    return transformation;
  }
  traverseGrouping(grouping: Grouping, kpuzzle: KPuzzle): KTransformation {
    const algTransformation = this.traverseAlg(grouping.alg, kpuzzle);
    return new KTransformation(
      kpuzzle,
      selfMultiplyTransformationUncached(
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

const algToTransformationInstance = new AlgToTransformationTraversal();
export const algToTransformation = algToTransformationInstance.traverseAlg.bind(
  algToTransformationInstance,
) as (alg: Alg, kpuzzle: KPuzzle) => KTransformation;

export function canConvertStateToUniqueTransformationUncached(
  definition: KPuzzleDefinition,
): boolean {
  for (const [orbitName, orbitDefinition] of Object.entries(definition)) {
    const pieces = new Array(orbitDefinition.numPieces).fill(false);
    for (const piece of this.definition.startStateData[orbitName].pieces) {
      pieces[piece] = true;
    }
    for (const piece of pieces) {
      if (!piece) {
        return false;
      }
    }
  }
  return true;
}
