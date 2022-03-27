import { experimentalNormalizePuzzleOrientation as normalize3x3x3Orientation } from "../../protocol";
import { KState } from "../KState";

// The `options` argument is required for now, because we haven't yet come up
// with a general way to specify different kinds of solved for the same puzle.
export function experimentalIs3x3x3Solved(
  state: KState,
  options: {
    ignorePuzzleOrientation: boolean;
    ignoreCenterOrientation: boolean;
  },
): boolean {
  if (options.ignorePuzzleOrientation) {
    state = normalize3x3x3Orientation(state);
  }
  if (options.ignoreCenterOrientation) {
    state = new KState(state.kpuzzle, {
      EDGES: state.stateData.EDGES,
      CORNERS: state.stateData.CORNERS,
      CENTERS: {
        pieces: state.stateData.CENTERS.pieces,
        orientation: new Array(6).fill(0),
      },
    });
  }
  return !!state.experimentalToTransformation()?.isIdentityTransformation(); // TODO: Compare to start state instead?
}
