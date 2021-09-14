export { customPGPuzzleLoader as experimentalCustomPGPuzzleLoader } from "./customPGPuzzleLoader";
export { experimentalCube3x3x3KPuzzle as experimentalCube3x3x3KPuzzle } from "../kpuzzle";

import type { PuzzleID } from "../twisty/old/dom/TwistyPlayerConfig";
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
  "master_tetraminx": genericPGPuzzleLoader(
    "master tetraminx",
    "Master Tetraminx",
    {
      inventedBy: ["Katsuhiko Okamoto"], // Using master pyraminx: https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1352
      inventionYear: 2002, // Using master pyraminx: https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1352
    },
  ),
};

export { cube2x2x2, cube3x3x3 };

export { getFaceletAppearance as experimentalGetFaceletAppearance } from "./stickerings/appearance";
export type {
  FaceletMeshAppearance as ExperimentalFaceletMeshAppearance,
  PuzzleAppearance as ExperimentalPuzzleAppearance,
} from "./stickerings/appearance";

const wcaEvents: Record<string, PuzzleID> = {
  "333": "3x3x3",
  "222": "2x2x2",
  "444": "4x4x4",
  "555": "5x5x5",
  "666": "6x6x6",
  "777": "7x7x7",
  "333bf": "3x3x3",
  "333fm": "3x3x3",
  "333oh": "3x3x3",
  "clock": "clock",
  "minx": "megaminx",
  "pyram": "pyraminx",
  "skewb": "skewb",
  "sq1": "square1",
  "444bf": "4x4x4",
  "555bf": "5x5x5",
};
export function puzzleIDForWCAEvent(event: string): PuzzleID | null {
  return wcaEvents[event] ?? null;
}
