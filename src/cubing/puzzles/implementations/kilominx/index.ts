import type { PuzzleLoader } from "../..";
import { getCached } from "../../async/lazy-cached";
import {
  asyncGetKPuzzleByDesc,
  descAsyncGetPuzzleGeometry,
} from "../../customPGPuzzleLoader";

const KILOMINX_PUZZLE_DESCRIPTION = "d f 0.56";

// TODO: Make this consistent with Megaminx corners
export const kilominx: PuzzleLoader = {
  id: "kilominx",
  fullName: "Kilominx",
  kpuzzle: getCached(() =>
    asyncGetKPuzzleByDesc(KILOMINX_PUZZLE_DESCRIPTION, {
      includeCenterOrbits: false,
      includeEdgeOrbits: false,
    }),
  ),
  pg: () =>
    descAsyncGetPuzzleGeometry(KILOMINX_PUZZLE_DESCRIPTION, {
      includeCenterOrbits: false,
      includeEdgeOrbits: false,
    }),
  svg: getCached(async () => {
    return (await import("../dynamic/unofficial/puzzles-dynamic-unofficial"))
      .kilominxSVG;
  }),
};
