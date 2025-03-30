import type { PuzzleID } from "../twisty";

interface EventInfo {
  puzzleID: PuzzleID;
  eventName: string;
}

export type WcaEventID =
  | "333"
  | "222"
  | "444"
  | "555"
  | "666"
  | "777"
  | "333bf"
  | "333fm"
  | "333oh"
  | "clock"
  | "minx"
  | "pyram"
  | "skewb"
  | "sq1"
  | "444bf"
  | "555bf"
  | "333mbf";

export const wcaEvents: Record<WcaEventID, EventInfo> = {
  "333": { puzzleID: "3x3x3", eventName: "3x3x3 Cube" },
  "222": { puzzleID: "2x2x2", eventName: "2x2x2 Cube" },
  "444": { puzzleID: "4x4x4", eventName: "4x4x4 Cube" },
  "555": { puzzleID: "5x5x5", eventName: "5x5x5 Cube" },
  "666": { puzzleID: "6x6x6", eventName: "6x6x6 Cube" },
  "777": { puzzleID: "7x7x7", eventName: "7x7x7 Cube" },
  "333bf": { puzzleID: "3x3x3", eventName: "3x3x3 Blindfolded" },
  "333fm": { puzzleID: "3x3x3", eventName: "3x3x3 Fewest Moves" },
  "333oh": { puzzleID: "3x3x3", eventName: "3x3x3 One-Handed" },
  clock: { puzzleID: "clock", eventName: "Clock" },
  minx: { puzzleID: "megaminx", eventName: "Megaminx" },
  pyram: { puzzleID: "pyraminx", eventName: "Pyraminx" },
  skewb: { puzzleID: "skewb", eventName: "Skewb" },
  sq1: { puzzleID: "square1", eventName: "Square-1" },
  "444bf": { puzzleID: "4x4x4", eventName: "4x4x4 Blindfolded" },
  "555bf": { puzzleID: "5x5x5", eventName: "5x5x5 Blindfolded" },
  "333mbf": { puzzleID: "3x3x3", eventName: "3x3x3 Multi-Blind" },
};

/** @category Event Info */
export function wcaEventInfo(event: WcaEventID): EventInfo | null {
  return wcaEvents[event] ?? null;
}

export type EventID =
  | WcaEventID
  | "333ft"
  | "fto"
  | "master_tetraminx"
  | "kilominx"
  | "redi_cube"
  | "baby_fto"
  | "loopover";

export const twizzleEvents: Record<EventID, EventInfo> = {
  ...wcaEvents,
  "333ft": { puzzleID: "3x3x3", eventName: "3x3x3 With Feet" },
  fto: { puzzleID: "fto", eventName: "Face-Turning Octahedron" },
  master_tetraminx: {
    puzzleID: "master_tetraminx",
    eventName: "Master Tetraminx",
  },
  kilominx: {
    puzzleID: "kilominx",
    eventName: "Kilominx",
  },
  redi_cube: {
    puzzleID: "redi_cube",
    eventName: "Redi Cube",
  },
  baby_fto: {
    puzzleID: "baby_fto",
    eventName: "Baby FTO",
  },
  loopover: {
    puzzleID: "loopover",
    eventName: "Loopover",
  },
};

/** @category Event Info */
export function eventInfo(event: EventID): EventInfo | null {
  return twizzleEvents[event] ?? null;
}
