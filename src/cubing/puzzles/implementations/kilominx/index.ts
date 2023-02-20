import type { PuzzleLoader } from "../..";
import { getCached } from "../../async/lazy-cached";
import {
  asyncGetKPuzzle,
  descAsyncGetPuzzleGeometry,
} from "../../customPGPuzzleLoader";

const KILOMINX_PUZZLE_DESCRIPTION = "d f 0.56";

// TODO: Make this consistent with Megaminx corners
export const kilominx: PuzzleLoader = {
  id: "kilominx",
  fullName: "Kilominx",
  kpuzzle: getCached(() => asyncGetKPuzzle(KILOMINX_PUZZLE_DESCRIPTION)),
  pg: () => descAsyncGetPuzzleGeometry(KILOMINX_PUZZLE_DESCRIPTION),
  svg: getCached(async () => {
    return (
      await import("../dynamic/unofficial/puzzles-dynamic-unofficial")
    ).kilominxSVG;
  }),
};
