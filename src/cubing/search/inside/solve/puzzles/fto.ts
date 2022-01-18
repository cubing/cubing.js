import type { Alg } from "../../../../alg";
import type { OldTransformation } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { randomStateFromSGS, TrembleSolver } from "../tremble";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./fto.sgs.json");
      const json: SGSCachedData = await sgs.sgsDataFTO();
      return new TrembleSolver(await sgs.ftoDef(), json, [
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
export async function solveFTO(state: OldTransformation): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(
    state,
    TREMBLE_DEPTH,
    () => 3, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}

let warned = false;
export async function randomFTOScramble(): Promise<Alg> {
  if (!warned) {
    console.warn(
      "FTO scrambles are not yet optimized. They may be much too long (≈90 moves).",
    );
    warned = true;
  }
  const sgs = await import("./fto.sgs.json");
  return solveFTO(
    await randomStateFromSGS(await sgs.ftoDef(), await sgs.sgsDataFTO()),
  );
}
