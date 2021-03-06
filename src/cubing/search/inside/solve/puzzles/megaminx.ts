import type { Alg } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { cachedMegaminxDefWithoutMO } from "./megaminx.sgs.json";
import { TrembleSolver } from "../tremble";

const TREMBLE_DEPTH = 2;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./megaminx.sgs.json");
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
    stateWithoutMO,
    TREMBLE_DEPTH,
    () => 5, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
