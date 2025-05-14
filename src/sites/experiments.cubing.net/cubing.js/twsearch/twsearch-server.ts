import { Alg } from "../../../../cubing/alg";
import type { KPattern, KPuzzle } from "../../../../cubing/kpuzzle";

const postJSONInit: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

export interface TwsearchServerClientOptions {
  startPattern?: KPattern;
  searchArgs?: {
    checkBeforeSolve?: "always" | "never" | "auto";
    randomStart?: boolean;
    minDepth?: number;
    maxDepth?: number;
    startPruneDepth?: number;
    quantumMetric?: boolean;
    generatorMoves?: string[];
  };
}

// TODO: dedup options with `cubing/search`
export async function solveTwsearchServer(
  kpuzzle: KPuzzle,
  kpattern: KPattern,
  options: TwsearchServerClientOptions,
): Promise<Alg> {
  if (options.searchArgs) {
    options.searchArgs.randomStart ??= true;
    options.searchArgs.startPruneDepth ??= 5;
  }
  const response = await fetch("http://localhost:2023/v0/solve/pattern", {
    ...postJSONInit,
    body: JSON.stringify({
      definition: kpuzzle.definition,
      pattern: kpattern.patternData,
      startPattern: options.startPattern,
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
