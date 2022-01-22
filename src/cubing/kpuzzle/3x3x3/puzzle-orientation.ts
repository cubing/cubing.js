import { experimentalNormalizePuzzleOrientation as normalize3x3x3Orientation } from "../../protocol";
import { KState } from "../KState";

// The `options` argument is required for now, because we haven't yet come up
// with a general way to specify different kinds of solved for the same puzle.
export function experimentalIs3x3x3Solved(
  state: KState,
  options: { ignoreCenterOrientation: boolean },
): boolean {
  let normalized = normalize3x3x3Orientation(state);
  if (options.ignoreCenterOrientation) {
    normalized = new KState(state.kpuzzle, {
      EDGES: normalized.stateData.EDGES,
      CORNERS: normalized.stateData.CORNERS,
      CENTERS: {
        pieces: normalized.stateData.CENTERS.pieces,
        orientation: new Array(6).fill(0),
      },
    });
  }
  return !!normalized
    .experimentalToTransformation()
    ?.isIdentityTransformation(); // TODO: Compare to start state instead?
}
