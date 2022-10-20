import { KPuzzle } from "../../../kpuzzle";
import type { ExperimentalStickering } from "../../../twisty";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import type { PuzzleLoader } from "../../PuzzleLoader";
import type { StickeringMask } from "../../stickerings/mask";
import {
  cubeLikeStickeringMask,
  cubeStickerings,
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
  svg: async () => {
    return (await import("../dynamic/side-events/puzzles-dynamic-side-events"))
      .cube2x2x2SVG;
  },
  pg: getCached(async () => {
    return asyncGetPuzzleGeometry("2x2x2");
  }),
  stickeringMask: (
    stickering: ExperimentalStickering,
  ): Promise<StickeringMask> => cubeLikeStickeringMask(cube2x2x2, stickering),
  stickerings: cubeStickerings,
};
