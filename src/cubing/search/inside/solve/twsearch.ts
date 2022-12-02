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
  maxDepth?: number;
  skipCancelling2x2x2Solutions?: boolean;
}

let existingPuzzleDefString: undefined | string;

function mustBeNaturalNumber(meaning: string, n: number): void {
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0) {
    throw new Error(`Invalid ${meaning}: ${n}`);
  }
}

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
  setArg("--startprunedepth 5"); // TODO
  if (options) {
    if (options.skipCancelling2x2x2Solutions) {
      setArg("--skipcancelling2x2x2solutions");
    }
    let { minDepth, maxDepth } = options;
    if (typeof minDepth !== "undefined") {
      mustBeNaturalNumber("minDepth", minDepth);
      if (typeof maxDepth !== "undefined") {
        mustBeNaturalNumber("maxDepth", maxDepth);
      } else {
        maxDepth = 1000000;
      }

      setArg("--randomstart");
      setArg(`--mindepth ${minDepth}`);
      setArg(`--maxdepth ${maxDepth}`);
    } else if (typeof maxDepth !== "undefined") {
      mustBeNaturalNumber("maxDepth", maxDepth);
      setArg("--mindepth 0");
      setArg(`--maxdepth ${maxDepth}`);
    }
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
