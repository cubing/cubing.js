import type { Alg } from "../../../../alg/index.ts";
import type { KPatternData } from "../../../../kpuzzle/index.ts";
import { KPattern } from "../../../../kpuzzle/index.ts";
import { mustBeInsideWorker } from "../../inside-worker.ts";
import type { SGSCachedData } from "../parseSGS.ts";
import { TrembleSolver } from "../tremble.ts";
import { searchDynamicSideEvents } from "./dynamic/sgs-side-events/index.ts";

const TREMBLE_DEPTH = 2;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const json: SGSCachedData = await (
        await searchDynamicSideEvents
      ).cachedSGSDataMegaminx();
      return new TrembleSolver(
        await (await searchDynamicSideEvents).cachedMegaminxKPuzzleWithoutMO(),
        json,
        ["U", "R", "F", "L", "BR", "BL", "FR", "FL", "DR", "DL", "B", "D"],
      );
    })())
  );
}

export async function preInitializeMegaminx(): Promise<void> {
  await getCachedTrembleSolver();
}

// TODO: centers
export async function solveMegaminx(pattern: KPattern): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const patternDataWithoutMO: KPatternData = structuredClone(
    pattern.patternData,
  );
  patternDataWithoutMO["CENTERS"].orientation = new Array(12).fill(0);
  const patternWithoutMO = new KPattern(
    await (await searchDynamicSideEvents).cachedMegaminxKPuzzleWithoutMO(),
    patternDataWithoutMO,
  );
  const alg = await trembleSolver.solve(
    patternWithoutMO,
    TREMBLE_DEPTH,
    () => 5, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
