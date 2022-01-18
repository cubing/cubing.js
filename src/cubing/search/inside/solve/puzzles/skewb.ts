import type { Alg, QuantumMove } from "../../../../alg";
import type { OldTransformation } from "../../../../kpuzzle";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { randomStateFromSGS, TrembleSolver } from "../tremble";
import {
  sgsDataSkewbFixedCorner,
  skewbDefWithoutMOCached,
} from "./skewb.sgs.json";

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgs = await import("./skewb.sgs.json");
      const json: SGSCachedData = await sgs.sgsDataSkewb();
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

function resetCenterOrientation(state: OldTransformation): OldTransformation {
  return {
    CORNERS: state.CORNERS,
    CENTERS: {
      permutation: state.CENTERS.permutation,
      orientation: new Array(6).fill(0),
    },
  };
}

// TODO: fix def consistency.
export async function solveSkewb(state: OldTransformation): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(
    resetCenterOrientation(state),
    TREMBLE_DEPTH,
    (quantumMove: QuantumMove) => (quantumMove.family === "y" ? 4 : 3), // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}

export async function randomSkewbFixedCornerState(): Promise<OldTransformation> {
  // Note: this sets all center orientations to 0.
  return randomStateFromSGS(
    await skewbDefWithoutMOCached(),
    await sgsDataSkewbFixedCorner(),
  );
}

export async function randomSkewbFixedCornerScramble(): Promise<Alg> {
  return solveSkewb(await randomSkewbFixedCornerState());
}
