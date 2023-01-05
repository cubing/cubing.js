import { KPuzzle } from "../../../kpuzzle";
import type { ExperimentalStickering } from "../../../twisty";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import type { PuzzleLoader } from "../../PuzzleLoader";
import type { StickeringMask } from "../../stickerings/mask";
import {
  cubeLikeStickeringList,
  cubeLikeStickeringMask,
} from "../../stickerings/cube-like-stickerings";

/** @category Specific Puzzles */
export const cube2x2x2: PuzzleLoader = {
  id: "2x2x2",
  fullName: "2×2×2 Cube",
  kpuzzle: getCached(
    async () =>
      new KPuzzle(
        (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
          .cube2x2x2JSON,
      ),
  ),
  svg: async () =>
    (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
      .cube2x2x2SVG,
  llSVG: getCached(
    async () =>
      (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
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
};
