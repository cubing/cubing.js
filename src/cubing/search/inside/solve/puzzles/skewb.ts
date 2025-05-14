import type { Alg, QuantumMove } from "../../../../alg";
import { KPattern } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";
import { searchDynamicSideEvents } from "./dynamic/sgs-side-events";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const json: SGSCachedData = await (
        await searchDynamicSideEvents
      ).sgsDataSkewb();
      return new TrembleSolver(
        await (await searchDynamicSideEvents).skewbKPuzzleWithoutMOCached(),
        json,
        "RLUB".split(""),
      );
    })())
  );
}

export async function preInitializeSkewb(): Promise<void> {
  await getCachedTrembleSolver();
}

async function resetCenterOrientation(pattern: KPattern): Promise<KPattern> {
  return new KPattern(
    await (await searchDynamicSideEvents).skewbKPuzzleWithoutMOCached(),
    {
      CORNERS: pattern.patternData["CORNERS"],
      CENTERS: {
        pieces: pattern.patternData["CENTERS"].pieces,
        orientation: new Array(6).fill(0),
      },
    },
  );
}

// TODO: fix def consistency.
export async function solveSkewb(pattern: KPattern): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(
    await resetCenterOrientation(pattern),
    TREMBLE_DEPTH,
    (quantumMove: QuantumMove) => (quantumMove.family === "y" ? 4 : 3), // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
