import type { PuzzleID } from "../twisty";

interface EventInfo {
  puzzleID: PuzzleID;
  eventName: string;
  /** Whether/how scrambles are implemented in `randomScrambleForEvent(…)` in this version of `cubing.js` */
  scramblesImplemented: null | "random-state" | "random-moves";
}

export const wcaEvents: Record<string, EventInfo> = {
  "333": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Cube",
    scramblesImplemented: "random-state",
  },
  "222": {
    puzzleID: "2x2x2",
    eventName: "2x2x2 Cube",
    scramblesImplemented: "random-state",
  },
  "444": {
    puzzleID: "4x4x4",
    eventName: "4x4x4 Cube",
    scramblesImplemented: "random-state",
  },
  "555": {
    puzzleID: "5x5x5",
    eventName: "5x5x5 Cube",
    scramblesImplemented: "random-moves",
  },
  "666": {
    puzzleID: "6x6x6",
    eventName: "6x6x6 Cube",
    scramblesImplemented: "random-moves",
  },
  "777": {
    puzzleID: "7x7x7",
    eventName: "7x7x7 Cube",
    scramblesImplemented: "random-moves",
  },
  "333bf": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Blindfolded",
    scramblesImplemented: "random-state",
  },
  "333fm": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Fewest Moves",
    scramblesImplemented: "random-state",
  },
  "333oh": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 One-Handed",
    scramblesImplemented: "random-state",
  },
  clock: {
    puzzleID: "clock",
    eventName: "Clock",
    scramblesImplemented: "random-state",
  },
  minx: {
    puzzleID: "megaminx",
    eventName: "Megaminx",
    scramblesImplemented: "random-moves",
  },
  pyram: {
    puzzleID: "pyraminx",
    eventName: "Pyraminx",
    scramblesImplemented: "random-state",
  },
  skewb: {
    puzzleID: "skewb",
    eventName: "Skewb",
    scramblesImplemented: "random-state",
  },
  sq1: {
    puzzleID: "square1",
    eventName: "Square-1",
    scramblesImplemented: "random-state",
  },
  "444bf": {
    puzzleID: "4x4x4",
    eventName: "4x4x4 Blindfolded",
    scramblesImplemented: "random-state",
  },
  "555bf": {
    puzzleID: "5x5x5",
    eventName: "5x5x5 Blindfolded",
    scramblesImplemented: "random-moves",
  },
  "333mbf": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Multi-Blind",
    scramblesImplemented: "random-state",
  },
};

/** @category Event Info */
export function wcaEventInfo(event: string): EventInfo | null {
  return wcaEvents[event] ?? null;
}

export const twizzleEvents: Record<string, EventInfo> = {
  ...wcaEvents,
  fto: {
    puzzleID: "fto",
    eventName: "Face-Turning Octahedron",
    scramblesImplemented: "random-state",
  },
  master_tetraminx: {
    puzzleID: "master_tetraminx",
    eventName: "Master Tetraminx",
    scramblesImplemented: "random-state",
  },
  kilominx: {
    puzzleID: "kilominx",
    eventName: "Kilominx",
    scramblesImplemented: "random-state",
  },
  redi_cube: {
    puzzleID: "redi_cube",
    eventName: "Redi Cube",
    scramblesImplemented: "random-state",
  },
  baby_fto: {
    puzzleID: "baby_fto",
    eventName: "Baby FTO",
    scramblesImplemented: "random-state",
  },
  loopover: {
    puzzleID: "loopover",
    eventName: "Loopover",
    scramblesImplemented: null,
  },
};

/** @category Event Info */
export function eventInfo(event: string): EventInfo | null {
  return twizzleEvents[event] ?? null;
}
