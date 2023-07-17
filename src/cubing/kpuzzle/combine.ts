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
    const stateOrbit = stateData[orbitName];
    const transformationOrbit = transformationData[orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        transformationOrbit,
      )
    ) {
      // common case for big cubes
      newStateData[orbitName] = stateOrbit;
    } else {
      const newPieces = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPieces[idx] =
            stateOrbit.pieces[transformationOrbit.permutation[idx]];
        }
        newStateData[orbitName] = {
          pieces: newPieces,
          orientation: stateOrbit.orientation, // copy all 0
          orientationMod: stateOrbit.orientationMod, // copy all 0
        };
      } else {
        const newOrientation = new Array(orbitDefinition.numPieces);
        const newOrientationMod = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          const transformationIdx = transformationOrbit.permutation[idx];
          const orientationMod = stateOrbit.orientationMod[transformationIdx];
          newOrientationMod[idx] = orientationMod;
          const mod = orientationMod || orbitDefinition.numOrientations;
          newOrientation[idx] =
            (stateOrbit.orientation[transformationIdx] +
              transformationOrbit.orientation[idx]) %
            mod; // We don't have to use `modIntoRange` (assuming input is well-formed), because we're adding.

          newPieces[idx] = stateOrbit.pieces[transformationIdx];
        }
        newStateData[orbitName] = {
          pieces: newPieces,
          orientation: newOrientation,
          orientationMod: newOrientationMod,
        };
      }
    }
  }
  return newStateData;
}
