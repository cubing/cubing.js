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

export async function solveTwsearch(
  def: KPuzzleDefinition,
  stateData: KTransformationData,
  options?: TwsearchOptions,
): Promise<string> {
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
  }
  await setKPuzzleDefString(serializeDefToTws(kpuzzle, options));
  return (
    await solveState(
      serializeKTransformationDataToTws("SearchState", stateData, true),
    )
  ).toString();
}
