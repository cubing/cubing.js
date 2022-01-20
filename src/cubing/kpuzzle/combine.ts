import { isOrbitTransformationDataIdentityUncached } from "./calculate";
import type {
  KPuzzleDefinition,
  KStateData,
  KTransformationData,
} from "./KPuzzleDefinition";

export function combineTransformationData(
  definition: KPuzzleDefinition,
  transformationData1: KTransformationData,
  transformationData2: KTransformationData,
): KTransformationData {
  const newTransformationData = {} as KTransformationData;
  for (const orbitName in definition.orbits) {
    const orbitDefinition = definition.orbits[orbitName];
    const orbit1 = transformationData1[orbitName];
    const orbit2 = transformationData2[orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        orbit2,
      )
    ) {
      // common case for big cubes
      newTransformationData[orbitName] = orbit1;
    } else if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        orbit1,
      )
    ) {
      newTransformationData[orbitName] = orbit2;
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitName] = {
          permutation: newPerm,
          orientation: orbit1.orientation,
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] =
            (orbit1.orientation[orbit2.permutation[idx]] +
              orbit2.orientation[idx]) %
            orbitDefinition.numOrientations;
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitName] = {
          permutation: newPerm,
          orientation: newOri,
        };
      }
    }
  }
  return newTransformationData;
}

export function applyTransformationDataToStateData(
  definition: KPuzzleDefinition,
  stateData: KStateData,
  transformationData: KTransformationData,
): KStateData {
  const newStateData = {} as KStateData;
  for (const orbitName in definition.orbits) {
    const orbitDefinition = definition.orbits[orbitName];
    const orbit1 = stateData[orbitName];
    const orbit2 = transformationData[orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        orbit2,
      )
    ) {
      // common case for big cubes
      newStateData[orbitName] = orbit1;
    } else {
      const newPieces = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPieces[idx] = orbit1.pieces[orbit2.permutation[idx]];
        }
        newStateData[orbitName] = {
          pieces: newPieces,
          orientation: orbit1.orientation,
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] =
            (orbit1.orientation[orbit2.permutation[idx]] +
              orbit2.orientation[idx]) %
            orbitDefinition.numOrientations;
          newPieces[idx] = orbit1.pieces[orbit2.permutation[idx]];
        }
        newStateData[orbitName] = {
          pieces: newPieces,
          orientation: newOri,
        };
      }
    }
  }
  return newStateData;
}
