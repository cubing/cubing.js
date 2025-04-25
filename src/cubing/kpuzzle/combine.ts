import { isOrbitTransformationDataIdentityUncached } from "./calculate";
import type {
  KPatternData,
  KPatternOrbitData,
  KPuzzleDefinition,
  KTransformationData,
} from "./KPuzzleDefinition";

export function combineTransformationData(
  definition: KPuzzleDefinition,
  transformationData1: KTransformationData,
  transformationData2: KTransformationData,
): KTransformationData {
  const newTransformationData = {} as KTransformationData;
  for (const orbitDefinition of definition.orbits) {
    const orbit1 = transformationData1[orbitDefinition.orbitName];
    const orbit2 = transformationData2[orbitDefinition.orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        orbit2,
      )
    ) {
      // common case for big cubes
      newTransformationData[orbitDefinition.orbitName] = orbit1;
    } else if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        orbit1,
      )
    ) {
      newTransformationData[orbitDefinition.orbitName] = orbit2;
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitDefinition.orbitName] = {
          permutation: newPerm,
          orientationDelta: orbit1.orientationDelta,
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] =
            (orbit1.orientationDelta[orbit2.permutation[idx]] +
              orbit2.orientationDelta[idx]) %
            orbitDefinition.numOrientations;
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitDefinition.orbitName] = {
          permutation: newPerm,
          orientationDelta: newOri,
        };
      }
    }
  }
  return newTransformationData;
}

export function applyTransformationDataToKPatternData(
  definition: KPuzzleDefinition,
  patternData: KPatternData,
  transformationData: KTransformationData,
): KPatternData {
  const newPatternData = {} as KPatternData;
  for (const orbitDefinition of definition.orbits) {
    const patternOrbit = patternData[orbitDefinition.orbitName];
    const transformationOrbit = transformationData[orbitDefinition.orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.numOrientations,
        transformationOrbit,
      )
    ) {
      // common case for big cubes
      newPatternData[orbitDefinition.orbitName] = patternOrbit;
    } else {
      const newPieces = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPieces[idx] =
            patternOrbit.pieces[transformationOrbit.permutation[idx]];
        }
        const newOrbitData: KPatternOrbitData = {
          pieces: newPieces,
          orientation: patternOrbit.orientation, // copy all 0
        };
        newPatternData[orbitDefinition.orbitName] = newOrbitData;
      } else {
        const newOrientation = new Array(orbitDefinition.numPieces);
        const newOrientationMod: number[] | undefined =
          patternOrbit.orientationMod
            ? new Array(orbitDefinition.numPieces)
            : undefined;
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          const transformationIdx = transformationOrbit.permutation[idx];
          let mod = orbitDefinition.numOrientations;
          if (patternOrbit.orientationMod) {
            const orientationMod =
              patternOrbit.orientationMod[transformationIdx];
            newOrientationMod![idx] = orientationMod;
            mod = orientationMod || orbitDefinition.numOrientations;
          }
          newOrientation[idx] =
            (patternOrbit.orientation[transformationIdx] +
              transformationOrbit.orientationDelta[idx]) %
            mod; // We don't have to use `modIntoRange` (assuming input is well-formed), because we're adding.
          newPieces[idx] = patternOrbit.pieces[transformationIdx];
        }
        const newOrbitData: KPatternOrbitData = {
          pieces: newPieces,
          orientation: newOrientation,
        };
        if (newOrientationMod) {
          newOrbitData.orientationMod = newOrientationMod;
        }
        newPatternData[orbitDefinition.orbitName] = newOrbitData;
      }
    }
  }
  return newPatternData;
}
