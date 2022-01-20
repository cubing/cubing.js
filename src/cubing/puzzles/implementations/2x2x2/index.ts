import { KPuzzle } from "../../../kpuzzle";
import type { ExperimentalStickering } from "../../../twisty";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { lazyCached } from "../../async/lazy-cached";
import type { PuzzleLoader } from "../../PuzzleLoader";
import type { PuzzleAppearance } from "../../stickerings/appearance";
import {
  cubeAppearance,
  cubeStickerings,
} from "../../stickerings/cube-stickerings";

export const cube2x2x2: PuzzleLoader = {
  id: "2x2x2",
  fullName: "2×2×2 Cube",
  kpuzzle: lazyCached(
    async () =>
      new KPuzzle(
        (await import("./2x2x2.kpuzzle.json")).cube2x2x2KPuzzleDefinition,
      ),
  ),
  svg: async () => {
    return (await import("./2x2x2.kpuzzle.svg")).default;
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("2x2x2");
  },
  appearance: (stickering: ExperimentalStickering): Promise<PuzzleAppearance> =>
    cubeAppearance(cube2x2x2, stickering),
  stickerings: cubeStickerings,
};
