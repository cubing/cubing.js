import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const cube4x4x4: PuzzleManager = {
  id: "4x4x4",
  fullName: "4×4×4 Cube",
  def: async () => {
    return asyncGetDef("4x4x4");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("4x4x4");
  },
};
