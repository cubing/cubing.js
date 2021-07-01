import type { Alg } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
import { puzzles } from "../../../../puzzles";
import { mustBeInsideWorker } from "../../../inside/inside-worker";
import type { SGSCachedData } from "../vendor/sgs/src/sgs";
import { TrembleSolver } from "../vendor/sgs/src/tremble";
import { simplifySkewbAlg } from "./simplifySkewbAlg";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const json: SGSCachedData = await (
        await import("../vendor/sgs/src/test/puzzles/skewb.sgs.json")
      ).cachedSGSDataSkewb();
      return new TrembleSolver(
        await puzzles.skewb.def(),
        json,
        "RLLUB".split(""),
      );
    })())
  );
}

export async function preInitializeSkewb(): Promise<void> {
  await getCachedTrembleSolver();
}

// TODO: fix def consistency.
export async function solveSkewb(state: Transformation): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(state, TREMBLE_DEPTH);
  return simplifySkewbAlg(alg);
}
