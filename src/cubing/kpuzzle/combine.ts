import { isOrbitTransformationDataIdentityUncached } from "./calculate";
import type {
  KPuzzleDefinition,
  KStateData,
  KTransformationData,
} from "./KPuzzleDefinition";
import { KStateOrbitView } from "./KState";
import { KTransformationOrbitView } from "./KTransformation";

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
      // TODO: handle "default" cases.
      const orbit1View = new KTransformationOrbitView(
        orbitDefinition,
        transformationData1,
        orbitName,
        false,
      );
      const orbit2View = new KTransformationOrbitView(
        orbitDefinition,
        transformationData1,
        orbitName,
        false,
      );
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPerm[idx] = orbit1View.getPermutationAt(
            orbit2View.getPermutationAt(idx),
          );
        }
        newTransformationData[orbitName] = {
          permutation: newPerm,
          orientation: orbit1.orientation,
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] =
            (orbit1View.getOrientationAt(orbit2View.getPermutationAt(idx)) +
              orbit2View.getOrientationAt(idx)) %
            orbitDefinition.numOrientations;
          newPerm[idx] = orbit1View.getPermutationAt(
            orbit2View.getPermutationAt(idx),
          );
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
      // TODO: handle "default" cases.
      const orbit1View = new KStateOrbitView(
        orbitDefinition,
        stateData,
        orbitName,
        false,
      );
      const orbit2View = new KTransformationOrbitView(
        orbitDefinition,
        transformationData,
        orbitName,
        false,
      );
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPieces[idx] = orbit1View.getPieceAt(
            orbit2View.getPermutationAt(idx),
          );
        }
        newStateData[orbitName] = {
          pieces: newPieces,
          orientation: orbit1?.orientation,
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] =
            (orbit1View.getOrientationAt(orbit2View.getPermutationAt(idx)) +
              orbit2View.getOrientationAt(idx)) %
            orbitDefinition.numOrientations;
          newPieces[idx] = orbit1View.getPieceAt(
            orbit2View.getPermutationAt(idx),
          );
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
