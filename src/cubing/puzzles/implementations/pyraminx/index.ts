import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { lazyKPuzzle } from "../../async/lazy-cached-kpuzzle";
import type { PuzzleLoader } from "../../PuzzleLoader";

export const pyraminx: PuzzleLoader = {
  id: "pyraminx",
  fullName: "Pyraminx",
  inventedBy: ["Uwe Meffert"],
  inventionYear: 1970, // https://en.wikipedia.org/wiki/Pyraminx#Description
  kpuzzle: lazyKPuzzle(async () => asyncGetDef("pyraminx")),
  svg: async () => {
    return (await import("./pyraminx.kpuzzle.svg")).default;
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("pyraminx");
  },
};
