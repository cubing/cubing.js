import { Alg } from "../../../../alg";
import { KState, KTransformation } from "../../../../kpuzzle";
import { experimental3x3x3KPuzzle } from "../../../cubing-private";

export function puzzleOrientation3x3x3Idx(state: KState): [number, number] {
  const idxU = state.stateData["CENTERS"].pieces[0];
  const idxD = state.stateData["CENTERS"].pieces[5];
  const unadjustedIdxL = state.stateData["CENTERS"].pieces[1];
  let idxL = unadjustedIdxL;
  if (idxU < unadjustedIdxL) {
    idxL--;
  }
  if (idxD < unadjustedIdxL) {
    idxL--;
  }
  return [idxU, idxL];
}

const puzzleOrientationCacheRaw: KTransformation[][] = new Array(6)
  .fill(0)
  .map(() => {
    return new Array<KTransformation>(6);
  });

const puzzleOrientationCacheInitialized = false;
export function puzzleOrientation3x3x3Cache(): KTransformation[][] {
  if (!puzzleOrientationCacheInitialized) {
    // We use a new block to avoid keeping a reference to temporary vars.
    // kpuzzle todo
    {
      const uAlgs: Alg[] = ["", "z", "x", "z'", "x'", "x2"].map((s) =>
        Alg.fromString(s),
      );
      const yAlg = new Alg("y");
      for (const uAlg of uAlgs) {
        let transformation = experimental3x3x3KPuzzle.algToTransformation(uAlg);
        for (let i = 0; i < 4; i++) {
          transformation = transformation.applyAlg(yAlg);
          const [idxU, idxL] = puzzleOrientation3x3x3Idx(
            transformation.toKState(),
          );
          puzzleOrientationCacheRaw[idxU][idxL] = transformation.invert();
        }
      }
    }
  }
  return puzzleOrientationCacheRaw;
}

export function normalize3x3x3Orientation(state: KState): KState {
  const [idxU, idxL] = puzzleOrientation3x3x3Idx(state);
  const orientationTransformation = puzzleOrientation3x3x3Cache()[idxU][idxL];
  return state.applyTransformation(orientationTransformation);
}

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
