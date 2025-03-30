import type { EventID } from "cubing/puzzles/events";
import type { Alg } from "../../../alg";
import type {
  KPattern,
  KPatternData,
  KPuzzleDefinition,
} from "../../../kpuzzle";
import { from } from "../../../vendor/mit/p-lazy/p-lazy";

export const twsearchPromise: Promise<
  typeof import("../../../vendor/mpl/twsearch")
> = from(async () => import("../../../vendor/mpl/twsearch"));

export interface TwsearchOptions {
  // TODO: start prune depth?
  generatorMoves?: string[];
  targetPattern?: KPatternData;
  minDepth?: number;
  maxDepth?: number;
}

export async function wasmTwsearch(
  def: KPuzzleDefinition,
  pattern: KPattern,
  options?: TwsearchOptions,
): Promise<Alg> {
  const { wasmTwsearch } = await twsearchPromise;
  return wasmTwsearch(def, pattern, options);
}

export async function wasmRandomScrambleForEvent(
  eventID: EventID,
): Promise<Alg> {
  const { wasmRandomScrambleForEvent } = await twsearchPromise;
  return wasmRandomScrambleForEvent(eventID);
}
