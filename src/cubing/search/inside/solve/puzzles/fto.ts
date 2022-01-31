import { Alg } from "../../../../alg";
import type { KState } from "../../../../kpuzzle/KState";
import { puzzles } from "../../../../puzzles";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./fto.dynamic");
      const json: SGSCachedData = await sgs.sgsDataFTO();
      return new TrembleSolver(await puzzles["fto"].kpuzzle(), json, [
        "U",
        "R",
        "F",
        "L",
        "D",
        "B",
        "BR",
        "BL",
      ]);
    })())
  );
}

export async function preInitializeFTO(): Promise<void> {
  await getCachedTrembleSolver();
}

// TODO: centers
export async function solveFTO(state: KState): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(
    state,
    TREMBLE_DEPTH,
    () => 3, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}

export async function randomFTOScramble(): Promise<Alg> {
  mustBeInsideWorker();
  const { randomFTOScrambleString } = await import("./fto.dynamic");
  return new Alg(await randomFTOScrambleString());
}
