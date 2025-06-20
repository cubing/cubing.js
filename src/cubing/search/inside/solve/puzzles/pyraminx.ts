import type { Alg } from "../../../../alg";
import type { KPattern } from "../../../../kpuzzle/KPattern";
import { puzzles } from "../../../../puzzles";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { randomPatternFromSGS, TrembleSolver } from "../tremble";
import { searchDynamicSideEvents } from "./dynamic/sgs-side-events";

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
        await puzzles["pyraminx"].kpuzzle(),
        json,
        "RLUB".split(""),
      );
    })())
  );
}

export async function preInitializePyraminx(): Promise<void> {
  await getCachedTrembleSolver();
}

export async function solvePyraminx(pattern: KPattern): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(pattern, TREMBLE_DEPTH, () => 3); // TODO: Attach quantum move order lookup to puzzle.
  return alg;
}

export async function randomPyraminxPatternFixedOrientation(): Promise<KPattern> {
  mustBeInsideWorker();
  // Note: this sets all center orientations to 0.
  return randomPatternFromSGS(
    await puzzles["pyraminx"].kpuzzle(),
    await (await searchDynamicSideEvents).sgsDataPyraminxFixedOrientation(),
  );
}
