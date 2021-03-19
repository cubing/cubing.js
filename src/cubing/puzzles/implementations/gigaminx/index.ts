import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const gigaminx: PuzzleManager = {
  id: "gigaminx",
  fullName: "Gigaminx",
  inventedBy: ["Tyler Fox"],
  inventionYear: 2006, // Earliest date from https://www.twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1475
  def: async () => {
    return asyncGetDef("gigaminx");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("gigaminx"); // TODO: fix uppercase mismatch
  },
};
