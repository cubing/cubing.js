import { Alg } from "../../../../cubing/alg";
import type { KPuzzle, KState } from "../../../../cubing/kpuzzle";

const postJSONInit: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

export interface TwsearchServerClientOptions {
  moveSubset?: string[];
  startState?: KState;
  searchArgs?: {
    checkBeforeSolve?: boolean;
    randomStart?: boolean;
    minDepth?: number;
    maxDepth?: number;
    startPruneDepth?: number;
    quantumMetric?: boolean;
  };
}

// TODO: dedup options with `cubing/search`
export async function solveTwsearchServer(
  kpuzzle: KPuzzle,
  kstate: KState,
  options: TwsearchServerClientOptions,
): Promise<Alg> {
  if (options.searchArgs) {
    options.searchArgs.checkBeforeSolve ??= true;
    options.searchArgs.randomStart ??= true;
    options.searchArgs.startPruneDepth ??= 5;
  }
  const response = await fetch("http://localhost:2023/v0/solve/state", {
    ...postJSONInit,
    body: JSON.stringify({
      definition: kpuzzle.definition,
      state: kstate.stateData,
      moveSubset: options.moveSubset,
      startState: options.startState,
      searchArgs: options.searchArgs,
      // TODO: min depth
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed! ${await response.text()}`);
  }
  const json = await response.json();
  console.log(json);
  return Alg.fromString(json.alg);
}
