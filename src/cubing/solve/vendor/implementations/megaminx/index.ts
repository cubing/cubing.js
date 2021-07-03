import type { Alg } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../../inside/inside-worker";
import type { SGSCachedData } from "../vendor/sgs/src/sgs";
import { cachedMegaminxDefWithoutMO } from "../vendor/sgs/src/test/puzzles/skewb.sgs.json";
import { TrembleSolver } from "../vendor/sgs/src/tremble";

const TREMBLE_DEPTH = 2;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import(
        "../vendor/sgs/src/test/puzzles/megaminx.sgs.json"
      );
      const json: SGSCachedData = await sgs.cachedSGSDataMegaminx();
      return new TrembleSolver(await cachedMegaminxDefWithoutMO(), json, [
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
export async function solveMegaminx(state: Transformation): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const stateWithoutMO: Transformation = JSON.parse(JSON.stringify(state));
  stateWithoutMO.CENTERS.orientation = new Array(12).fill(0);
  const alg = await trembleSolver.solve(
    state,
    TREMBLE_DEPTH,
    () => 5, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
