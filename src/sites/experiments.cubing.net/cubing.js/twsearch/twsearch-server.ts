import { Alg } from "../../../../cubing/alg";
import type { KPuzzle, KState } from "../../../../cubing/kpuzzle";

const postJSONInit: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

// TODO: dedup options with `cubing/search`
export async function solveTwsearchServer(
  kpuzzle: KPuzzle,
  kstate: KState,
  options: { moveSubset?: string[]; startState?: KState; minDepth?: number },
): Promise<Alg> {
  console.log(
    await fetch("http://localhost:2023/v0/config/arg", {
      method: "POST",
      body: "--startprunedepth 5", // TODO: do this on the server?
    }),
  );
  if ("minDepth" in options) {
    console.warn("Ignoring option (not implemented yet): minDepth");
  }
  const response = await fetch("http://localhost:2023/v0/solve/state", {
    ...postJSONInit,
    body: JSON.stringify({
      definition: kpuzzle.definition,
      state: kstate.stateData,
      moveSubset: options.moveSubset,
      startState: options.startState,
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
