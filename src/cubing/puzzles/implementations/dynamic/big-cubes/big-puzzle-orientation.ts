import { Alg, Grouping } from "../../../../alg";
import type { KPattern, KPuzzle } from "../../../../kpuzzle";

export function puzzleOrientationBigCubeIdx(
  pattern: KPattern,
): [number, number] {
  const idxUFR = pattern.patternData["CORNERS"].pieces[0];
  const oriUFR = pattern.patternData["CORNERS"].orientation[0];
  return [idxUFR, oriUFR];
}

const puzzleOrientationBigCubeCacheRaw: Alg[][] = new Array(8)
  .fill(0)
  .map(() => {
    return new Array<Alg>(3);
  });

const puzzleOrientationBigCubeCacheInitialized = false;
export function puzzleOrientationBigCubeCache(
  bigCubeKPuzzle: KPuzzle, // TODO
): Alg[][] {
  if (!puzzleOrientationBigCubeCacheInitialized) {
    // We use a new block to avoid keeping a reference to temporary vars.
    // kpuzzle todo
    {
      const uAlgs: Alg[] = [
        "",
        "y",
        "y2",
        "y'",
        "x2",
        "x2 y",
        "x2 y2",
        "x2 y'",
      ].map((s) => Alg.fromString(s));
      const UFRAlg = new Alg("Rv Uv");
      for (const uAlg of uAlgs) {
        let transformation = bigCubeKPuzzle.algToTransformation(uAlg);
        for (let i = 0; i < 4; i++) {
          const [idxUFR, oriUFR] = puzzleOrientationBigCubeIdx(
            transformation.toKPattern(),
          );
          puzzleOrientationBigCubeCacheRaw[idxUFR][oriUFR] = new Alg([
            ...uAlg.childAlgNodes(),
            new Grouping(UFRAlg, i), // TODO: make this more efficient
          ]).invert();
          if (i === 3) {
            // Avoid an unnecessary transformation calculation.
            break;
          }
          transformation = transformation.applyAlg(UFRAlg);
        }
      }
    }
  }
  return puzzleOrientationBigCubeCacheRaw;
}

export function normalizeBigCubeOrientation(pattern: KPattern): KPattern {
  const [idxUFR, oriUFR] = puzzleOrientationBigCubeIdx(pattern);
  const orientationAlg = puzzleOrientationBigCubeCache(pattern.kpuzzle)[idxUFR][
    oriUFR
  ];
  return pattern.applyAlg(orientationAlg);
}

// The `options` argument is required for now, because we haven't yet come up
// with a general way to specify different kinds of solved for the same puzle.
export function experimentalIsBigCubeSolved(
  pattern: KPattern,
  options: {
    ignorePuzzleOrientation: boolean;
    ignoreCenterOrientation: boolean; // Unused for 4×4×4
  },
): boolean {
  if (options.ignorePuzzleOrientation) {
    pattern = normalizeBigCubeOrientation(pattern);
  }
  console.log({ pattern });
  console.log({ p: pattern.kpuzzle.defaultPattern() });
  return pattern.isIdentical(pattern.kpuzzle.defaultPattern());
}
