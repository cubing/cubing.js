import { Alg } from "../../../../cubing/alg";
import type { KPuzzle, KState } from "../../../../cubing/kpuzzle";

const postJSONInit: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

export interface TwsearchServerClientOptions {
  startState?: KState;
  searchArgs?: {
    checkBeforeSolve?: "always" | "never" | "auto";
    randomStart?: boolean;
    minDepth?: number;
    maxDepth?: number;
    startPruneDepth?: number;
    quantumMetric?: boolean;
    moveSubset?: string[];
  };
}

// TODO: dedup options with `cubing/search`
export async function solveTwsearchServer(
  kpuzzle: KPuzzle,
  kstate: KState,
  options: TwsearchServerClientOptions,
): Promise<Alg> {
  if (options.searchArgs) {
    options.searchArgs.randomStart ??= true;
    options.searchArgs.startPruneDepth ??= 5;
  }
  const response = await fetch("http://localhost:2023/v0/solve/state", {
    ...postJSONInit,
    body: JSON.stringify({
      definition: kpuzzle.definition,
      state: kstate.stateData,
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
