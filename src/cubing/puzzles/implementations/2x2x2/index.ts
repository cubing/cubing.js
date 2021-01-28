import { asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const cube2x2x2: PuzzleManager = {
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
