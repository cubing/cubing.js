// Include 3x3x3 in the main bundle for better performance.
import type { ExperimentalStickering } from "../../../twisty";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import { experimental3x3x3KPuzzle } from "../../cubing-private";
import type { PuzzleLoader } from "../../PuzzleLoader";
import {
  cubeLikeStickeringList,
  cubeLikeStickeringMask,
} from "../../stickerings/cube-like-stickerings";
import type { StickeringMask } from "../../stickerings/mask";
import { cube3x3x3KeyMapping } from "./cube3x3x3KeyMapping";
import { puzzleSpecificSimplifyOptions333 } from "./puzzle-specific-simplifications";

/** @category Specific Puzzles */
export const cube3x3x3 = {
  id: "3x3x3",
  fullName: "3×3×3 Cube",
  inventedBy: ["Ernő Rubik"],
  inventionYear: 1974, // https://en.wikipedia.org/wiki/Rubik%27s_Cube#Conception_and_development
  kpuzzle: getCached(async () => {
    return experimental3x3x3KPuzzle;
  }),
  svg: getCached(async () => {
    return (await import("../dynamic/3x3x3/puzzles-dynamic-3x3x3"))
      .cube3x3x3SVG;
  }),
  llSVG: getCached(async () => {
    return (await import("../dynamic/3x3x3/puzzles-dynamic-3x3x3"))
      .cube3x3x3LLSVG;
  }),
  llFaceSVG: getCached(async () => {
    return (await import("../dynamic/3x3x3/puzzles-dynamic-3x3x3"))
      .cube3x3x3LLFaceSVG;
  }),
  pg: getCached(async () => {
    return asyncGetPuzzleGeometry("3x3x3");
  }),
  stickeringMask: (
    stickering: ExperimentalStickering,
  ): Promise<StickeringMask> => cubeLikeStickeringMask(cube3x3x3, stickering),
  stickerings: () => cubeLikeStickeringList("3x3x3"),
  puzzleSpecificSimplifyOptions: puzzleSpecificSimplifyOptions333,
  keyMapping: async () => cube3x3x3KeyMapping, // TODO: async loading
} satisfies PuzzleLoader;
