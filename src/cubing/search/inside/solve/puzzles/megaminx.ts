import type { Alg } from "../../../../alg";
import type { KStateData } from "../../../../kpuzzle";
import { KState } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";
import { cachedMegaminxKPuzzleWithoutMO } from "./megaminx.sgs.json";

const TREMBLE_DEPTH = 2;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./megaminx.sgs.json");
      const json: SGSCachedData = await sgs.cachedSGSDataMegaminx();
      return new TrembleSolver(await cachedMegaminxKPuzzleWithoutMO(), json, [
        "U",
        "R",
        "F",
        "L",
        "BR",
        "BL",
        "FR",
        "FL",
        "DR",
        "DL",
        "B",
        "D",
      ]);
    })())
  );
}

export async function preInitializeMegaminx(): Promise<void> {
  await getCachedTrembleSolver();
}

// TODO: centers
export async function solveMegaminx(state: KState): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const stateDataWithoutMO: KStateData = JSON.parse(
    JSON.stringify(state.stateData),
  );
  stateDataWithoutMO.CENTERS.orientation = new Array(12).fill(0);
  const stateWithoutMO = new KState(
    await cachedMegaminxKPuzzleWithoutMO(),
    stateDataWithoutMO,
  );
  const alg = await trembleSolver.solve(
    stateWithoutMO,
    TREMBLE_DEPTH,
    () => 5, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
