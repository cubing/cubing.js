import type { Alg, QuantumMove } from "../../../../alg";
import type { Transformation } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../sgs";
import { TrembleSolver } from "../tremble";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./skewb.sgs.json");
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
  const alg = await trembleSolver.solve(
    newState,
    TREMBLE_DEPTH,
    (quantumMove: QuantumMove) => (quantumMove.family === "y" ? 4 : 3), // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
