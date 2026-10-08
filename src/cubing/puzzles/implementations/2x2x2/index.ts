import { KPuzzle } from "../../../kpuzzle/index.ts";
import { experimentalIs2x2x2Solved } from "../../../puzzles/cubing-private/index.ts";
import type { ExperimentalStickering } from "../../../twisty/index.ts";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d.ts";
import { getCached } from "../../async/lazy-cached.ts";
import type { PuzzleLoader } from "../../PuzzleLoader.ts";
import {
  cubeLikeStickeringList,
  cubeLikeStickeringMask,
} from "../../stickerings/cube-like-stickerings.ts";
import type { StickeringMask } from "../../stickerings/mask.ts";
import { cubeMirrorTransforms } from "../3x3x3/index.ts";

/** @category Specific Puzzles */
export const cube2x2x2: PuzzleLoader = {
  id: "2x2x2",
  fullName: "2×2×2 Cube",
  kpuzzle: getCached(async () => {
    const kpuzzle = new KPuzzle(
      (await import("../dynamic/side-events/puzzles-dynamic-side-events.ts"))
        .cube2x2x2JSON,
    );
    kpuzzle.definition.experimentalIsPatternSolved = experimentalIs2x2x2Solved;
    return kpuzzle;
  }),
  svg: async () =>
    (await import("../dynamic/side-events/puzzles-dynamic-side-events.ts"))
      .cube2x2x2SVG,
  llSVG: getCached(
    async () =>
      (await import("../dynamic/side-events/puzzles-dynamic-side-events.ts"))
        .cube2x2x2LLSVG,
  ),
  pg: getCached(async () => {
    return asyncGetPuzzleGeometry("2x2x2");
  }),
  stickeringMask: (
    stickering: ExperimentalStickering,
  ): Promise<StickeringMask> => cubeLikeStickeringMask(cube2x2x2, stickering),
  stickerings: () =>
    cubeLikeStickeringList("2x2x2", { use3x3x3Fallbacks: true }),
  algTransformData: cubeMirrorTransforms,
};
