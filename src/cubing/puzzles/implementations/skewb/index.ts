import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const skewb: PuzzleManager = {
  id: "skewb",
  fullName: "Skewb",
  inventedBy: ["Tony Durham"], // https://www.jaapsch.net/puzzles/skewb.htm
  // inventionYear: 1982, // 1928 is actually the year of Hofstadter's column.
  def: async () => {
    return asyncGetDef("skewb");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("skewb"); // TODO: fix uppercase mismatch
  },
};
