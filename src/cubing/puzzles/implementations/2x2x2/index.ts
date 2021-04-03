import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleLoader } from "../../PuzzleLoader";

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
};
