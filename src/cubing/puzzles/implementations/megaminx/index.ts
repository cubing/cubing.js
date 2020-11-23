import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const megaminx: PuzzleManager = {
  id: "megaminx",
  fullName: "Megaminx",
  // Too many simultaneous inventors to name.
  inventionYear: 1981, // Earliest date from https://www.jaapsch.net/puzzles/megaminx.htm
  def: async () => {
    return asyncGetDef("megaminx");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("megaminx"); // TODO: fix uppercase mismatch
  },
};
