import { asyncGetDef, asyncGetPuzzleGeometry } from "../../async/async-pg3d";
import { PuzzleManager } from "../../PuzzleManager";

export const fto: PuzzleManager = {
  id: "fto",
  fullName: "Face-Turning Octahedron",
  inventedBy: ["Karl Rohrbach", "David Pitcher"], // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
  inventionYear: 1983, // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
  def: async () => {
    return asyncGetDef("FTO");
  },
  svg: async () => {
    throw "Unimplemented!";
  },
  pg: async () => {
    return asyncGetPuzzleGeometry("FTO"); // TODO: fix uppercase mismatch
  },
};
