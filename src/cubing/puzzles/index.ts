import { PuzzleManager } from "./PuzzleManager";

import { cube3x3x3 } from "./implementations/3x3x3";
import { cube2x2x2 } from "./implementations/2x2x2";
import { pyraminx } from "./implementations/pyraminx";
import { clock } from "./implementations/clock";
import { square1 } from "./implementations/square1";
import { fto } from "./implementations/fto";
import { Puzzles } from "../puzzle-geometry/Puzzles";
import { asyncGetDef, asyncGetPuzzleGeometry } from "./async/async-pg3d";

export const puzzles: Record<string, PuzzleManager> = {
  /******** Start of WCA Puzzles *******/
  "3x3x3": cube3x3x3,
  "2x2x2": cube2x2x2,
  // 4x4x4 Cube
  // 5x5x5 Cube
  // 6x6x6 Cube
  // 7x7x7 Cube
  // 3x3x3 Blindfolded
  // 3x3x3 Fewest Moves
  // 3x3x3 One-Handed
  clock,
  // Megaminx
  pyraminx,
  // Skewb
  square1,
  // 4x4x4 Blindfolded
  // 5x5x5 Blindfolded
  /******** End of WCA puzzles ********/
  fto,
};

// TODO: find a better way to share these defs.
for (const puzzleName of Object.keys(Puzzles)) {
  if (!(puzzleName in puzzles)) {
    puzzles[puzzleName] = {
      id: "puzzleName",
      fullName: "puzzleName (PG3D)",
      def: async () => {
        return asyncGetDef(puzzleName);
      },
      svg: async () => {
        throw "Unimplemented!";
      },
      pg3d: async () => {
        return asyncGetPuzzleGeometry(puzzleName);
      },
    };
  }
}
