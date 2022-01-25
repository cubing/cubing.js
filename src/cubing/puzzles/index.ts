export { customPGPuzzleLoader as experimentalCustomPGPuzzleLoader } from "./customPGPuzzleLoader";
export { experimental3x3x3KPuzzle } from "../kpuzzle";

export { cubeAppearance as experimentalCubeAppearance } from "./stickerings/cube-stickerings";

import type { PuzzleID } from "../twisty";
import { CubePGPuzzleLoader, PGPuzzleLoader } from "./async/async-pg3d";
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
  "4x4x4": new CubePGPuzzleLoader({ id: "4x4x4", fullName: "4×4×4 Cube" }),
  "5x5x5": new CubePGPuzzleLoader({ id: "5x5x5", fullName: "5×5×5 Cube" }),
  "6x6x6": new CubePGPuzzleLoader({ id: "6x6x6", fullName: "6×6×6 Cube" }),
  "7x7x7": new CubePGPuzzleLoader({ id: "7x7x7", fullName: "7×7×7 Cube" }),
  "40x40x40": new CubePGPuzzleLoader({
    id: "40x40x40",
    fullName: "40×40×40 Cube",
  }),
  // 3x3x3 Blindfolded
  // 3x3x3 Fewest Moves
  // 3x3x3 One-Handed
  clock,
  "megaminx": megaminx,
  pyraminx,
  "skewb": new PGPuzzleLoader({
    id: "skewb",
    fullName: "Skewb",
    inventedBy: ["Tony Durham"], // https://www.jaapsch.net/puzzles/skewb.htm
    // inventionYear: 1982, // 1982 is actually the year of Hofstadter's column.
  }),
  square1,
  // 4x4x4 Blindfolded
  // 5x5x5 Blindfolded
  /******** End of WCA puzzles ********/
  "fto": fto,
  "gigaminx": new PGPuzzleLoader({
    id: "gigaminx",
    fullName: "Gigaminx",
    inventedBy: ["Tyler Fox"],
    inventionYear: 2006, // Earliest date from https://www.twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1475
  }),
  "master_tetraminx": new PGPuzzleLoader({
    id: "master tetraminx",
    fullName: "Master Tetraminx",
    inventedBy: ["Katsuhiko Okamoto"], // Using master pyraminx: https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1352
    inventionYear: 2002, // Using master pyraminx: https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1352
  }),
};

export { cube2x2x2, cube3x3x3 };

export { getFaceletAppearance as experimentalGetFaceletAppearance } from "./stickerings/appearance";
export type {
  FaceletMeshAppearance as ExperimentalFaceletMeshAppearance,
  PuzzleAppearance as ExperimentalPuzzleAppearance,
} from "./stickerings/appearance";

interface WCAEventInfo {
  puzzleID: PuzzleID;
  eventName: string;
}

const wcaEvents: Record<string, WCAEventInfo> = {
  "333": { puzzleID: "3x3x3", eventName: "3x3x3 Cube" },
  "222": { puzzleID: "2x2x2", eventName: "2x2x2 Cube" },
  "444": { puzzleID: "4x4x4", eventName: "4x4x4 Cube" },
  "555": { puzzleID: "5x5x5", eventName: "5x5x5 Cube" },
  "666": { puzzleID: "6x6x6", eventName: "6x6x6 Cube" },
  "777": { puzzleID: "7x7x7", eventName: "7x7x7 Cube" },
  "333bf": { puzzleID: "3x3x3", eventName: "3x3x3 Blindfolded" },
  "333fm": { puzzleID: "3x3x3", eventName: "3x3x3 Fewest Moves" },
  "333oh": { puzzleID: "3x3x3", eventName: "3x3x3 One-Handed" },
  "clock": { puzzleID: "clock", eventName: "Clock" },
  "minx": { puzzleID: "megaminx", eventName: "Megaminx" },
  "pyram": { puzzleID: "pyraminx", eventName: "Pyraminx" },
  "skewb": { puzzleID: "skewb", eventName: "Skewb" },
  "sq1": { puzzleID: "square1", eventName: "Square-1" },
  "444bf": { puzzleID: "4x4x4", eventName: "4x4x4 Blindfolded" },
  "555bf": { puzzleID: "5x5x5", eventName: "5x5x5 Blindfolded" },
  "333mb": { puzzleID: "3x3x3", eventName: "3x3x3 Multi-Blind" },
};

export function wcaEventInfo(event: string): WCAEventInfo | null {
  return wcaEvents[event] ?? null;
}
