import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const cube5x5x5: PuzzleManager = {
  id: "5x5x5",
  fullName: "5x5x5",
  def: async () => {
    return asyncGetDef("5x5x5");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("5x5x5");
  },
};
