// Include 3x3x3 in the main bundle for better performance.
import type { ExperimentalStickering } from "../../../twisty";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import { experimental3x3x3KPuzzle } from "../../cubing-private";
import type { PuzzleLoader } from "../../PuzzleLoader";
import type { StickeringMask } from "../../stickerings/mask";
import {
  cubeLikeStickeringMask,
  cubeStickerings,
} from "../../stickerings/cube-like-stickerings";
import { puzzleSpecificSimplifyOptions333 } from "./puzzle-specific-simplifications";

/** @category Specific Puzzles */
export const cube3x3x3: PuzzleLoader = {
  id: "3x3x3",
  fullName: "3×3×3 Cube",
  inventedBy: ["Ernő Rubik"],
  inventionYear: 1974, // https://en.wikipedia.org/wiki/Rubik%27s_Cube#Conception_and_development
  kpuzzle: getCached(async () => {
    return experimental3x3x3KPuzzle;
  }),
  svg: getCached(async () => {
    return (
      await import("../dynamic/3x3x3/puzzles-dynamic-3x3x3")
    ).cube3x3x3SVG;
  }),
  llSVG: getCached(async () => {
    return (
      await import("../dynamic/3x3x3/puzzles-dynamic-3x3x3")
    ).cube3x3x3LLSVG;
  }),
  pg: getCached(async () => {
    return asyncGetPuzzleGeometry("3x3x3");
  }),
  stickeringMask: (
    stickering: ExperimentalStickering,
  ): Promise<StickeringMask> => cubeLikeStickeringMask(cube3x3x3, stickering),
  stickerings: cubeStickerings,
  puzzleSpecificSimplifyOptions: puzzleSpecificSimplifyOptions333,
};
