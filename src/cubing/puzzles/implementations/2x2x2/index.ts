import { ExperimentalStickering } from "../../../twisty";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleLoader } from "../../PuzzleLoader";
import { PuzzleAppearance } from "../../stickerings/appearance";
import {
  cubeStickering,
  cubeStickerings,
} from "../../stickerings/cube-stickerings";

export const cube2x2x2: PuzzleLoader = {
  id: "2x2x2",
  fullName: "2×2×2 Cube",
  def: async () => {
    return await import("./2x2x2.kpuzzle.json");
  },
  svg: async () => {
    return (await import("./2x2x2.kpuzzle.svg")).default;
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("2x2x2"); // TODO: def compat
  },
  appearance: (stickering: ExperimentalStickering): Promise<PuzzleAppearance> =>
    cubeStickering(cube2x2x2, stickering),
  stickerings: cubeStickerings,
};
