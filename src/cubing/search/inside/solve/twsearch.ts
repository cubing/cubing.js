import type { Alg } from "../../../alg";
import {
  KPuzzle,
  KPuzzleDefinition,
  KTransformationData,
} from "../../../kpuzzle";
import { from } from "../../../vendor/mit/p-lazy/p-lazy";

export const twsearchPromise: Promise<
  typeof import("../../../vendor/mpl/twsearch")
> = from(async () => import("../../../vendor/mpl/twsearch"));

export interface TwsearchOptions {
  moveSubset?: string[];
  startState?: KTransformationData;
  minDepth?: number;
  maxDepth?: number;
}

let existingPuzzleDefString: undefined | string;
let existingMoveSubsetString: undefined | string;

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
  let moveSubsetString = ""; // TODO: pass the full set of moves, to avoid rotations not being treated as moves.
  if (options) {
    if (options.moveSubset) {
      moveSubsetString = options?.moveSubset?.join(",");
      // TODO: better, reusable validation
      if (moveSubsetString.includes(" ")) {
        throw new Error("A move contains a space‽");
      }
      if (moveSubsetString.includes("-")) {
        throw new Error("A move contains a dash");
      }
      setArg(`--moves ${moveSubsetString}`); // TODO: remove the need for this.
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

  if (
    typeof existingMoveSubsetString !== "undefined" &&
    moveSubsetString !== existingMoveSubsetString
  ) {
    throw new Error(
      "Attempted to solve two different move subsets in the same worker using `twsearch`. This is not currently supported!",
    );
  }

  return await solveState(
    serializeKTransformationDataToTws("SearchState", stateData, true),
  );
}
