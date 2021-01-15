import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const cube6x6x6: PuzzleManager = {
  id: "6x6x6",
  fullName: "6x6x6",
  def: async () => {
    return asyncGetDef("6x6x6");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("6x6x6");
  },
};
