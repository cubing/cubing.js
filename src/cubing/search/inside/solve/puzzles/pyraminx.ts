import type { Alg } from "../../../../alg";
import type { KState } from "../../../../kpuzzle/KState";
import { puzzles } from "../../../../puzzles";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { randomStateFromSGS, TrembleSolver } from "../tremble";
import { searchDynamicSideEvents } from "./dynamic/side-events";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const json: SGSCachedData = await (
        await searchDynamicSideEvents
      ).sgsDataPyraminx();
      return new TrembleSolver(
        await puzzles.pyraminx.kpuzzle(),
        json,
        "RLUB".split(""),
      );
    })())
  );
}

export async function preInitializePyraminx(): Promise<void> {
  await getCachedTrembleSolver();
}

export async function solvePyraminx(state: KState): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(state, TREMBLE_DEPTH, () => 3); // TODO: Attach quantum move order lookup to puzzle.
  return alg;
}

export async function randomPyraminxStateFixedOrientation(): Promise<KState> {
  mustBeInsideWorker();
  // Note: this sets all center orientations to 0.
  return randomStateFromSGS(
    await puzzles.pyraminx.kpuzzle(),
    await (await searchDynamicSideEvents).sgsDataPyraminxFixedOrientation(),
  );
}

export async function randomPyraminxScrambleFixedOrientation(): Promise<Alg> {
  return solvePyraminx(await randomPyraminxStateFixedOrientation());
}
