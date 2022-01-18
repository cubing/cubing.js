import { combineTransformationData } from "./combine";
import type { KPuzzle } from "./KPuzzle";
import type {
  KOrbitDefinition,
  KOrbitTransformationData,
  KTransformationData,
} from "./KPuzzleDefinition";

export function isOrbitTransformationDataIdentityUncached(
  numOrientations: number,
  orbitTransformationData: KOrbitTransformationData,
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
  orbitTransformationData1: KOrbitTransformationData,
  orbitTransformationData2: KOrbitTransformationData,
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
    return kpuzzle.identityTransformation().data; // TODO
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
