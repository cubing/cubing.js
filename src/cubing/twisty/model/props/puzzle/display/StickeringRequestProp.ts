import { experimentalStickerings } from "../../../../../puzzles/cubing-private/index.ts";
import { SimpleTwistyPropSource } from "../../TwistyProp.ts";
import type { PuzzleID } from "../structure/PuzzleIDRequestProp.ts";

// TODO: turn these maps into lists?
// TODO: alg.cubing.net parity

export type ExperimentalStickering = keyof typeof experimentalStickerings;

export function getStickeringGroup(
  stickering: ExperimentalStickering,
  puzzleID: PuzzleID,
): string {
  const groups = experimentalStickerings[stickering]?.groups;
  if (!groups) {
    return "Stickering";
  }
  return groups[puzzleID] ?? "Stickering";
}

export class StickeringRequestProp extends SimpleTwistyPropSource<ExperimentalStickering | null> {
  getDefaultValue(): ExperimentalStickering | null {
    return null;
  }
}
