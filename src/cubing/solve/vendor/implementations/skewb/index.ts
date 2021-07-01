import type { Alg } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
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
      const sgs = await import("../vendor/sgs/src/test/puzzles/skewb.sgs.json");
      const json: SGSCachedData = await sgs.cachedSGSDataSkewb();
      return new TrembleSolver(
        await sgs.skewbDefWithoutMOCached(),
        json,
        "RLUB".split(""),
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
  const newState = {
    CORNERS: state.CORNERS,
    CENTERS: {
      permutation: state.CENTERS.permutation,
      orientation: new Array(6).fill(0),
    },
  };
  console.log("state", state, newState);
  const alg = await trembleSolver.solve(newState, TREMBLE_DEPTH);
  return simplifySkewbAlg(alg);
}
