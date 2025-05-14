import { Alg } from "../../../../alg";
import type { KPattern, KPuzzle, KTransformation } from "../../../../kpuzzle";

export function puzzleOrientation2x2x2Idx(pattern: KPattern): number {
  const inverse = pattern.experimentalToTransformation()!.invert();

  const inverseDFL = inverse.transformationData["CORNERS"];
  return inverseDFL.permutation[6] * 3 + inverseDFL.orientationDelta[6];
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
          const idx = puzzleOrientation2x2x2Idx(transformation.toKPattern());
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

export function normalize2x2x2Orientation(pattern: KPattern): {
  normalizedPattern: KPattern;
  normalizationAlg: Alg;
} {
  const idx = puzzleOrientation2x2x2Idx(pattern);
  const { transformation, alg } = puzzleOrientation2x2x2Cache(pattern.kpuzzle)[
    idx
  ];
  return {
    normalizedPattern: pattern.applyTransformation(transformation),
    normalizationAlg: alg.invert(),
  };
}

// The `options` argument is required for now, because we haven't yet come up
// with a general way to specify different kinds of solved for the same puzle.
export function experimentalIs2x2x2Solved(
  pattern: KPattern,
  options: {
    ignorePuzzleOrientation: boolean;
  },
): boolean {
  if (options.ignorePuzzleOrientation) {
    pattern = normalize2x2x2Orientation(pattern).normalizedPattern;
  }
  return !!pattern.experimentalToTransformation()!.isIdentityTransformation(); // TODO: Compare to start pattern instead?
}
