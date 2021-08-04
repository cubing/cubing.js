import type { Alg } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
import { puzzles } from "../../../../puzzles";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { randomStateFromSGS, TrembleSolver } from "../tremble";
import { sgsDataPyraminxFixedOrientation } from "./pyraminx.sgs.json";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./pyraminx.sgs.json");
      const json: SGSCachedData = await sgs.sgsDataPyraminx();
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

export async function randomPyraminxStateFixedOrientation(): Promise<Transformation> {
  // Note: this sets all center orientations to 0.
  return randomStateFromSGS(
    await puzzles.pyraminx.def(),
    await sgsDataPyraminxFixedOrientation(),
  );
}

export async function randomPyraminxScrambleFixedOrientation(): Promise<Alg> {
  return solvePyraminx(await randomPyraminxStateFixedOrientation());
}
