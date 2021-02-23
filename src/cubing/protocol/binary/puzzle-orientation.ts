import { Alg } from "../../alg";
import {
  combineTransformations,
  invertTransformation,
  KPuzzle,
  Transformation,
} from "../../kpuzzle";
// TODO: Should we expose this directly in the `puzzles` package for sync uses?
import { cube3x3x3KPuzzle as def } from "../../puzzles/implementations/3x3x3/3x3x3.kpuzzle.json_";

export function puzzleOrientationIdx(state: Transformation): [number, number] {
  const idxU = state["CENTERS"].permutation[0];
  const idxD = state["CENTERS"].permutation[5];
  const unadjustedIdxL = state["CENTERS"].permutation[1];
  let idxL = unadjustedIdxL;
  if (idxU < unadjustedIdxL) {
    idxL--;
  }
  if (idxD < unadjustedIdxL) {
    idxL--;
  }
  return [idxU, idxL];
}

const puzzleOrientationCache: Transformation[][] = new Array(6)
  .fill(0)
  .map(() => {
    return new Array(6);
  });

// We use a new block to avoid keeping a reference to temporary vars.
{
  const orientationKpuzzle = new KPuzzle(def);
  const uAlgs: Alg[] = ["", "z", "x", "z'", "x'", "x2"].map((s) =>
    Alg.fromString(s),
  );
  const yAlg = new Alg("y");
  for (const uAlg of uAlgs) {
    orientationKpuzzle.reset();
    orientationKpuzzle.applyAlg(uAlg);
    for (let i = 0; i < 4; i++) {
      orientationKpuzzle.applyAlg(yAlg);
      const [idxU, idxL] = puzzleOrientationIdx(orientationKpuzzle.state);
      puzzleOrientationCache[idxU][idxL] = invertTransformation(
        def,
        orientationKpuzzle.state,
      );
    }
  }
}

export function normalizePuzzleOrientation(s: Transformation): Transformation {
  const [idxU, idxL] = puzzleOrientationIdx(s);
  const orientationTransformation = puzzleOrientationCache[idxU][idxL];
  return combineTransformations(def, s, orientationTransformation);
}

// TODO: combine with `orientPuzzle`?
export function reorientPuzzle(
  s: Transformation,
  idxU: number,
  idxL: number,
): Transformation {
  const orientationTransformation = invertTransformation(
    def,
    puzzleOrientationCache[idxU][idxL],
  );
  return combineTransformations(def, s, orientationTransformation);
}
