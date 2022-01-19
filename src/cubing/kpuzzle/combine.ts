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
  const def = definition;
  for (const orbitName in def.orbits) {
    const orbitDefinition = def.orbits[orbitName];
    const o1 = transformationData1[orbitName];
    const o2 = transformationData2[orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.orientations,
        o2,
      )
    ) {
      // common case for big cubes
      newTransformationData[orbitName] = o1;
    } else if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.orientations,
        o1,
      )
    ) {
      newTransformationData[orbitName] = o2;
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.orientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPerm[idx] = o1.permutation[o2.permutation[idx]];
        }
        newTransformationData[orbitName] = {
          permutation: newPerm,
          orientation: o1.orientation,
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] =
            (o1.orientation[o2.permutation[idx]] + o2.orientation[idx]) %
            orbitDefinition.orientations;
          newPerm[idx] = o1.permutation[o2.permutation[idx]];
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
  const def = definition;
  for (const orbitName in def.orbits) {
    const orbitDefinition = def.orbits[orbitName];
    const o1 = stateData[orbitName];
    const o2 = transformationData[orbitName];
    if (
      isOrbitTransformationDataIdentityUncached(
        orbitDefinition.orientations,
        o2,
      )
    ) {
      // common case for big cubes
      newStateData[orbitName] = o1;
    } else {
      const newPieces = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.orientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPieces[idx] = o1.pieces[o2.permutation[idx]];
        }
        newStateData[orbitName] = {
          pieces: newPieces,
          orientation: o1.orientation,
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] =
            (o1.orientation[o2.permutation[idx]] + o2.orientation[idx]) %
            orbitDefinition.orientations;
          newPieces[idx] = o1.pieces[o2.permutation[idx]];
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
