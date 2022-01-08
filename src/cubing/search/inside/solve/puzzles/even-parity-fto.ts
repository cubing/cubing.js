import type { Alg } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { randomStateFromSGS, TrembleSolver } from "../tremble";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./even-parity-fto.sgs.json");
      const json: SGSCachedData = await sgs.sgsDataEvenParityFTO();
      return new TrembleSolver(await sgs.evenParityFTODef(), json, [
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

export async function preInitializeEvenParityFTO(): Promise<void> {
  await getCachedTrembleSolver();
}

// TODO: centers
export async function solveEvenParityFTO(state: Transformation): Promise<Alg> {
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
export async function randomEvenParityFTOScramble(): Promise<Alg> {
  if (!warned) {
    console.warn(
      "FTO scrambles are not yet optimized. They may be much too long (≈90 moves).",
    );
    warned = true;
  }
  const sgs = await import("./even-parity-fto.sgs.json");
  return solveEvenParityFTO(
    await randomStateFromSGS(
      await sgs.evenParityFTODef(),
      await sgs.sgsDataEvenParityFTO(),
    ),
  );
}
