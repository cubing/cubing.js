import { cube2x2x2 } from "./implementations/2x2x2";
import { cube3x3x3 } from "./implementations/3x3x3";
import { clock } from "./implementations/clock";
import { fto } from "./implementations/fto";
import { megaminx } from "./implementations/megaminx";
import { pyraminx } from "./implementations/pyraminx";
import { skewb } from "./implementations/skewb";
import { square1 } from "./implementations/square1";
import { PuzzleManager } from "./PuzzleManager";

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
  megaminx,
  pyraminx,
  skewb,
  square1,
  // 4x4x4 Blindfolded
  // 5x5x5 Blindfolded
  /******** End of WCA puzzles ********/
  fto,
};

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
