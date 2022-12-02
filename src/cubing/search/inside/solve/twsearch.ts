import type { Alg } from "../../../alg";
import {
  KPuzzle,
  KPuzzleDefinition,
  KTransformationData,
} from "../../../kpuzzle";
import { from } from "../../../vendor/p-lazy/p-lazy";

export const twsearchPromise: Promise<
  typeof import("../../../vendor/twsearch")
> = from(async () => import("../../../vendor/twsearch"));

export interface TwsearchOptions {
  moveSubset?: string[];
  startState?: KTransformationData;
  minDepth?: number;
}

let existingPuzzleDefString: undefined | string;

export async function solveTwsearch(
  def: KPuzzleDefinition,
  stateData: KTransformationData,
  options?: TwsearchOptions,
): Promise<Alg> {
  const {
    setArg,
    setKPuzzleDefString,
    serializeDefToTws,
    solveState,
    serializeKTransformationDataToTws,
  } = await twsearchPromise;
  const kpuzzle = new KPuzzle(def);
  if (options && "minDepth" in options) {
    const { minDepth } = options;
    if (
      typeof minDepth !== "number" ||
      !Number.isInteger(minDepth) ||
      minDepth < 0
    ) {
      throw new Error(`Invalid min depth: ${minDepth}`);
    }
    setArg("--randomstart");
    setArg(`--mindepth ${minDepth}`);
    setArg("--startprunedepth 5");
  }

  const puzzleDefString = serializeDefToTws(kpuzzle, options);
  if (existingPuzzleDefString) {
    if (existingPuzzleDefString !== puzzleDefString) {
      throw new Error(
        "Attempted to solve two puzzles in the same worker using `twsearch`. This is not currently supported!",
      );
    }
  } else {
    existingPuzzleDefString = puzzleDefString;
    await setKPuzzleDefString(puzzleDefString);
  }

  return await solveState(
    serializeKTransformationDataToTws("SearchState", stateData, true),
  );
}
