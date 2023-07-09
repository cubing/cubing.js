import { KState } from "./KState";
import { KTransformation } from "./KTransformation";
import { isOrbitTransformationIdentityUncached } from "./calculate";

export function combineTransformations(
  transformation1: KTransformation,
  transformation2: KTransformation,
): KTransformation {
  const { definition } = transformation1.kpuzzle;
  const combinedTransformation = new KTransformation(
    transformation1.kpuzzle,
    {},
  );
  for (const orbitName in definition.orbits) {
    const orbitView1 = transformation1.orbitView(orbitName);
    const orbitView2 = transformation2.orbitView(orbitName);
    const combinedOrbitView = combinedTransformation.orbitView(orbitName, true);
    if (isOrbitTransformationIdentityUncached(orbitView2)) {
      // common case for big cubes
      combinedOrbitView.setFrom(orbitView1);
    } else if (isOrbitTransformationIdentityUncached(orbitView1)) {
      combinedOrbitView.setFrom(orbitView2);
    } else {
      const { orbitDefinition } = orbitView1;
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          combinedOrbitView.setPermutationAt(
            idx,
            orbitView1.getPermutationAt(orbitView2.getPermutationAt(idx)),
          );
        }
      } else {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          combinedOrbitView.setOrientationAt(
            idx,
            orbitView1.getOrientationAt(orbitView2.getPermutationAt(idx)) +
              orbitView2.getOrientationAt(idx),
          );
          combinedOrbitView.setPermutationAt(
            idx,
            orbitView1.getPermutationAt(orbitView2.getPermutationAt(idx)),
          );
        }
      }
    }
  }
  return combinedTransformation;
}

export function applyTransformationToState(
  originalState: KState,
  transformation: KTransformation,
): KState {
  const newState = new KState(originalState.kpuzzle, {});
  for (const stateOrbitView of originalState.orbitViews()) {
    const { orbitDefinition, orbitName } = stateOrbitView;
    const transformationOrbitView = transformation.orbitView(orbitName);
    const newStateOrbitView = newState.orbitView(orbitName, true);
    if (isOrbitTransformationIdentityUncached(transformationOrbitView)) {
      // common case for big cubes
      newStateOrbitView.setFrom(stateOrbitView);
    } else {
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newStateOrbitView.setPieceAt(
            idx,
            transformationOrbitView.getPermutationAt(idx),
          );
        }
        // Skip setting orientation (since `numOrientations` is 1.)
      } else {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newStateOrbitView.setPieceAt(
            idx,
            stateOrbitView.getPieceAt(
              transformationOrbitView.getPermutationAt(idx),
            ),
          );
          newStateOrbitView.setOrientationAt(
            idx,
            stateOrbitView.getOrientationAt(
              transformationOrbitView.getPermutationAt(idx),
            ) + transformationOrbitView.getOrientationAt(idx),
          );
        }
      }
    }
  }
  return newState;
}
