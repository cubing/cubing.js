import type { Alg } from "../../../../alg";
import type { KStateData } from "../../../../kpuzzle";
import { KState } from "../../../../kpuzzle";
import { from } from "../../../../vendor/p-lazy/p-lazy";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";

const dynamic = from<
  typeof import("./dynamic/side-events/search-dynamic-side-events")
>(() => import("./dynamic/side-events/search-dynamic-side-events"));

const TREMBLE_DEPTH = 2;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const json: SGSCachedData = await (await dynamic).cachedSGSDataMegaminx();
      return new TrembleSolver(
        await (await dynamic).cachedMegaminxKPuzzleWithoutMO(),
        json,
        ["U", "R", "F", "L", "BR", "BL", "FR", "FL", "DR", "DL", "B", "D"],
      );
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
    await (await dynamic).cachedMegaminxKPuzzleWithoutMO(),
    stateDataWithoutMO,
  );
  const alg = await trembleSolver.solve(
    stateWithoutMO,
    TREMBLE_DEPTH,
    () => 5, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
