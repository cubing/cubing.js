import { Alg } from "../../../../alg";
import type { KPuzzle, KState, KTransformation } from "../../../../kpuzzle";
import {
  getOriAtIndex,
  getPermOrPieceAtIndex,
} from "../../../../kpuzzle/sparse";

export function puzzleOrientation2x2x2Idx(state: KState): number {
  const inverse = state.experimentalToTransformation()!.invert();

  const inverseDFL = inverse.transformationData["CORNERS"];
  return (
    getPermOrPieceAtIndex(6, inverseDFL.permutation) * 3 +
    getOriAtIndex(6, inverseDFL.orientation)
  );
}

const puzzleOrientationCacheRaw: {
  transformation: KTransformation;
  alg: Alg;
}[] = new Array<KTransformation>(24) as any;

const puzzleOrientationCacheInitialized = false;
// We rely on the (first) caller to pass in the `KPuzzle`, so that we don't need to get our own synchronous reference.
export function puzzleOrientation2x2x2Cache(
  kpuzzle: KPuzzle,
): typeof puzzleOrientationCacheRaw {
  if (!puzzleOrientationCacheInitialized) {
    {
      const uAlgs: Alg[] = ["", "z", "x", "z'", "x'", "x2"].map((s) =>
        Alg.fromString(s),
      );
      const yAlg = new Alg("y");
      for (const uAlg of uAlgs) {
        let transformation = kpuzzle.algToTransformation(uAlg);
        for (let i = 0; i < 4; i++) {
          transformation = transformation.applyAlg(yAlg);
          const idx = puzzleOrientation2x2x2Idx(transformation.toKState());
          puzzleOrientationCacheRaw[idx] = {
            transformation: transformation.invert(),
            alg: uAlg.concat(yAlg),
          };
        }
      }
    }
  }
  return puzzleOrientationCacheRaw;
}

export function normalize2x2x2Orientation(state: KState): {
  normalizedState: KState;
  normalizationAlg: Alg;
} {
  const idx = puzzleOrientation2x2x2Idx(state);
  const { transformation, alg } = puzzleOrientation2x2x2Cache(state.kpuzzle)[
    idx
  ];
  return {
    normalizedState: state.applyTransformation(transformation),
    normalizationAlg: alg.invert(),
  };
}

// The `options` argument is required for now, because we haven't yet come up
// with a general way to specify different kinds of solved for the same puzle.
export function experimentalIs2x2x2Solved(
  state: KState,
  options: {
    ignorePuzzleOrientation: boolean;
  },
): boolean {
  if (options.ignorePuzzleOrientation) {
    state = normalize2x2x2Orientation(state).normalizedState;
  }
  return !!state.experimentalToTransformation()!.isIdentityTransformation(); // TODO: Compare to start state instead?
}
