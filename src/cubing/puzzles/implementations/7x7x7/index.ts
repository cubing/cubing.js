import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const cube7x7x7: PuzzleManager = {
  id: "7x7x7",
  fullName: "7×7×7 Cube",
  def: async () => {
    return asyncGetDef("7x7x7");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("7x7x7");
  },
};
