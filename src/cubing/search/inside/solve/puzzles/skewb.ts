import type { Alg, QuantumMove } from "../../../../alg/index.ts";
import { KPattern } from "../../../../kpuzzle/index.ts";
import { mustBeInsideWorker } from "../../inside-worker.ts";
import type { SGSCachedData } from "../parseSGS.ts";
import { TrembleSolver } from "../tremble.ts";
import { searchDynamicSideEvents } from "./dynamic/sgs-side-events/index.ts";

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
