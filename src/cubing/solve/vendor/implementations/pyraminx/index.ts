import { puzzles } from "../../../../puzzles";
import type { Alg } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../../inside/inside-worker";
import type { SGSCachedData } from "../vendor/sgs/src/sgs";
import { TrembleSolver } from "../vendor/sgs/src/tremble";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import(
        "../vendor/sgs/src/test/puzzles/pyraminx.sgs.json"
      );
      const json: SGSCachedData = await sgs.cachedSGSDataPyraminx();
      return new TrembleSolver(
        await puzzles.pyraminx.def(),
        json,
        "RLUB".split(""),
      );
    })())
  );
}

export async function preInitializePyraminx(): Promise<void> {
  await getCachedTrembleSolver();
}

export async function solvePyraminx(state: Transformation): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(state, TREMBLE_DEPTH, () => 3); // TODO: Attach quantum move order lookup to puzzle.
  return alg;
}
