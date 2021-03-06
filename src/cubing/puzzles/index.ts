export { cube3x3x3KPuzzle as experimentalCube3x3x3KPuzzle } from "./implementations/3x3x3/3x3x3.kpuzzle.json_";

import { cubePGPuzzleLoader, genericPGPuzzleLoader } from "./async/async-pg3d";
import { cube2x2x2 } from "./implementations/2x2x2";
import { cube3x3x3 } from "./implementations/3x3x3";
import { clock } from "./implementations/clock";
import { fto } from "./implementations/fto";
import { megaminx } from "./implementations/megaminx";
import { pyraminx } from "./implementations/pyraminx";
import { square1 } from "./implementations/square1";
import type { PuzzleLoader } from "./PuzzleLoader";

export type { PuzzleLoader };

export const puzzles: Record<string, PuzzleLoader> = {
  /******** Start of WCA Puzzles *******/
  "3x3x3": cube3x3x3,
  "2x2x2": cube2x2x2,
  "4x4x4": cubePGPuzzleLoader("4x4x4", "4×4×4 Cube"),
  "5x5x5": cubePGPuzzleLoader("5x5x5", "5×5×5 Cube"),
  "6x6x6": cubePGPuzzleLoader("6x6x6", "6×6×6 Cube"),
  "7x7x7": cubePGPuzzleLoader("7x7x7", "7×7×7 Cube"),
  "40x40x40": cubePGPuzzleLoader("40x40x40", "40×40×40 Cube"),
  // 3x3x3 Blindfolded
  // 3x3x3 Fewest Moves
  // 3x3x3 One-Handed
  clock,
  "megaminx": megaminx,
  pyraminx,
  "skewb": genericPGPuzzleLoader("skewb", "Skewb", {
    inventedBy: ["Tony Durham"], // https://www.jaapsch.net/puzzles/skewb.htm
    // inventionYear: 1982, // 1982 is actually the year of Hofstadter's column.
  }),
  square1,
  // 4x4x4 Blindfolded
  // 5x5x5 Blindfolded
  /******** End of WCA puzzles ********/
  "fto": fto,
  "gigaminx": genericPGPuzzleLoader("gigaminx", "Gigaminx", {
    inventedBy: ["Tyler Fox"],
    inventionYear: 2006, // Earliest date from https://www.twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1475
  }),
};

export { cube2x2x2, cube3x3x3 };

export { getFaceletAppearance as experimentalGetFaceletAppearance } from "./stickerings/appearance";
export type {
  FaceletMeshAppearance as ExperimentalFaceletMeshAppearance,
  PuzzleAppearance as ExperimentalPuzzleAppearance,
} from "./stickerings/appearance";

// // TODO: find a better way to share these defs.
// for (const puzzleName of [
//   // "2x2x2",
//   // "3x3x3",
//   "4x4x4",
//   "5x5x5",
//   "6x6x6",
//   "7x7x7",
//   "8x8x8",
//   "9x9x9",
//   "10x10x10",
//   "11x11x11",
//   "12x12x12",
//   "13x13x13",
//   "20x20x20",
//   "30x30x30",
//   // "skewb",
//   "master skewb",
//   "professor skewb",
//   "compy cube",
//   "helicopter",
//   "curvy copter",
//   "dino",
//   "little chop",
//   "pyramorphix",
//   "mastermorphix",
//   "pyraminx",
//   "master pyraminx",
//   "professor pyraminx",
//   "Jing pyraminx",
//   "master pyramorphix",
//   // "megaminx",
//   "gigaminx",
//   "pentultimate",
//   "starminx",
//   "starminx 2",
//   "pyraminx crystal",
//   "chopasaurus",
//   "big chop",
//   "skewb diamond",
//   // "FTO",
//   "Christopher's jewel",
//   "octastar",
//   "Trajber's octahedron",
//   "radio chop",
//   "icosamate",
//   "icosahedron 2",
//   "icosahedron 3",
//   "icosahedron static faces",
//   "icosahedron moving faces",
//   "Eitan's star",
//   "2x2x2 + dino",
//   "2x2x2 + little chop",
//   "dino + little chop",
//   "2x2x2 + dino + little chop",
//   "megaminx + chopasaurus",
//   "starminx combo",
// ]) {
//   if (!(puzzleName in puzzles)) {
//     puzzles[puzzleName] = {
//       id: puzzleName,
//       fullName: `${puzzleName} (PG3D)`,
//       def: async () => {
//         return asyncGetDef(puzzleName);
//       },
//       svg: async () => {
//         throw "Unimplemented!";
//       },
//       pg3d: async () => {
//         return asyncGetPuzzleGeometry(puzzleName);
//       },
//     };
//   }
// }
