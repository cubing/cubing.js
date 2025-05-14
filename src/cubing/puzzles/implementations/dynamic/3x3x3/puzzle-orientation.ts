import { Alg } from "../../../../alg";
import { KPattern, type KTransformation } from "../../../../kpuzzle";
import { experimental3x3x3KPuzzle } from "../../../cubing-private";

export function puzzleOrientation3x3x3Idx(pattern: KPattern): [number, number] {
  const idxU = pattern.patternData["CENTERS"].pieces[0];
  const idxD = pattern.patternData["CENTERS"].pieces[5];
  const unadjustedIdxL = pattern.patternData["CENTERS"].pieces[1];
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
            transformation.toKPattern(),
          );
          puzzleOrientationCacheRaw[idxU][idxL] = transformation.invert();
        }
      }
    }
  }
  return puzzleOrientationCacheRaw;
}

export function normalize3x3x3Orientation(pattern: KPattern): KPattern {
  const [idxU, idxL] = puzzleOrientation3x3x3Idx(pattern);
  const orientationTransformation = puzzleOrientation3x3x3Cache()[idxU][idxL];
  return pattern.applyTransformation(orientationTransformation);
}

// The `options` argument is required for now, because we haven't yet come up
// with a general way to specify different kinds of solved for the same puzle.
export function experimentalIs3x3x3Solved(
  pattern: KPattern,
  options: {
    ignorePuzzleOrientation: boolean;
    ignoreCenterOrientation: boolean;
  },
): boolean {
  if (options.ignorePuzzleOrientation) {
    pattern = normalize3x3x3Orientation(pattern);
  }
  // TODO(orientationMod)
  if (options.ignoreCenterOrientation) {
    pattern = new KPattern(pattern.kpuzzle, {
      EDGES: pattern.patternData["EDGES"],
      CORNERS: pattern.patternData["CORNERS"],
      CENTERS: {
        pieces: pattern.patternData["CENTERS"].pieces,
        orientation: new Array(6).fill(0),
      },
    });
  }
  return !!pattern.experimentalToTransformation()?.isIdentityTransformation(); // TODO: Compare to start state instead?
}
