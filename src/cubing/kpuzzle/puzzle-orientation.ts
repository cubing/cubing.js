import { experimentalNormalizePuzzleOrientation as normalize3x3x3Orientation } from "../protocol";
import type { Transformation } from "./definition_types";
import { cube3x3x3KPuzzle as def } from "./3x3x3/3x3x3.kpuzzle.json_";
import {
  areOrbitTransformationsEquivalent,
  areTransformationsEquivalent,
} from "./transformations";

// The `options` argument is required for now, because we haven't yet come up
// with a general way to specify different kinds of solved for the same puzle.
export function experimentalIs3x3x3Solved(
  transformation: Transformation,
  options: { ignoreCenterOrientation: boolean },
): boolean {
  const normalized = normalize3x3x3Orientation(transformation);
  if (options.ignoreCenterOrientation) {
    return (
      areOrbitTransformationsEquivalent(
        def,
        "EDGES",
        normalized,
        def.startPieces,
      ) &&
      areOrbitTransformationsEquivalent(
        def,
        "CORNERS",
        normalized,
        def.startPieces,
      )
    );
  } else {
    return areTransformationsEquivalent(def, normalized, def.startPieces);
  }
}
