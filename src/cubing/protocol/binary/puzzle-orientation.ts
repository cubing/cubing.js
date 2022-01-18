import { Alg } from "../../alg";
import { experimental3x3x3KPuzzle, KTransformation } from "../../kpuzzle";
import type { KState } from "../../kpuzzle/KState";

export function puzzleOrientationIdx(state: KState): [number, number] {
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

const puzzleOrientationCache: KTransformation[][] = new Array(6)
  .fill(0)
  .map(() => {
    return new Array<KTransformation>(6);
  });

// We use a new block to avoid keeping a reference to temporary vars.
{
  const uAlgs: Alg[] = ["", "z", "x", "z'", "x'", "x2"].map((s) =>
    Alg.fromString(s),
  );
  const yAlg = new Alg("y");
  for (const uAlg of uAlgs) {
    let transformation = experimental3x3x3KPuzzle.algToTransformation(uAlg);
    for (let i = 0; i < 4; i++) {
      transformation = transformation.applyAlg(yAlg);
      const [idxU, idxL] = puzzleOrientationIdx(transformation.toKState());
      puzzleOrientationCache[idxU][idxL] = transformation.invert();
    }
  }
}

export function normalizePuzzleOrientation(state: KState): KState {
  const [idxU, idxL] = puzzleOrientationIdx(state);
  const orientationTransformation = puzzleOrientationCache[idxU][idxL];
  return state.applyTransformation(orientationTransformation);
}

// TODO: combine with `orientPuzzle`?
export function reorientPuzzle(
  state: KState,
  idxU: number,
  idxL: number,
): KState {
  return state.applyTransformation(puzzleOrientationCache[idxU][idxL].invert());
}
