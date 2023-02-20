import type { PuzzleLoader } from "../..";
import type { Move } from "../../../alg";
import { KPuzzle, KTransformationData } from "../../../kpuzzle";
import type { ExperimentalPGNotation } from "../../../puzzle-geometry";
import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { getCached } from "../../async/lazy-cached";
import { asyncGetKPuzzle, descAsyncGetPuzzleGeometry } from "../../customPGPuzzleLoader";

// TODO: Make this consistent with Megaminx corners
export const kilominx: PuzzleLoader = {
  id: "kilominx",
  fullName: "Kilominx",
  kpuzzle: getCached(() => asyncGetKPuzzle("d f 0.56")),
  pg: () => descAsyncGetPuzzleGeometry("d f 0.56"),
  svg: getCached(async () => {
    return (
      await import("../dynamic/unofficial/puzzles-dynamic-unofficial")
    ).kilominxSVG;
  }),
};
