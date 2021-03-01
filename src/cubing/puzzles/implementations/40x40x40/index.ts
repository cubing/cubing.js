import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const cube40x40x40: PuzzleManager = {
  id: "40x40x40",
  fullName: "40×40×40 Cube",
  def: async () => {
    return asyncGetDef("40x40x40");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("40x40x40");
  },
};
