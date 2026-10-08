import { LazyPromise } from "@cubing/lazy-promise";
import { Alg } from "../../../../alg/index.ts";
import type { KPattern } from "../../../../kpuzzle/KPattern.ts";
import { puzzles } from "../../../../puzzles/index.ts";
import { mustBeInsideWorker } from "../../inside-worker.ts";
import type { SGSCachedData } from "../parseSGS.ts";
import { TrembleSolver } from "../tremble.ts";
import { dynamicFTO } from "./dynamic/fto/index.ts";

const dynamic = new LazyPromise(
  () => import("./dynamic/sgs-unofficial/search-dynamic-sgs-unofficial.ts"),
);

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const json: SGSCachedData = await (await dynamic).sgsDataFTO();
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
export async function solveFTO(pattern: KPattern): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(
    pattern,
    TREMBLE_DEPTH,
    () => 3, // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}

export async function randomFTOScramble(): Promise<Alg> {
  mustBeInsideWorker();
  return new Alg(await (await dynamicFTO).getRandomFTOScramble());
}
