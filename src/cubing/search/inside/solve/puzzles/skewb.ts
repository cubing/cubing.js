import type { Alg, QuantumMove } from "../../../../alg";
import { KState } from "../../../../kpuzzle";
import { from } from "../../../../vendor/p-lazy/p-lazy";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { randomStateFromSGS, TrembleSolver } from "../tremble";

const dynamic = from<
  typeof import("./dynamic/side-events/search-dynamic-side-events")
>(() => import("./dynamic/side-events/search-dynamic-side-events"));

const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const json: SGSCachedData = await (await dynamic).sgsDataSkewb();
      return new TrembleSolver(
        await (await dynamic).skewbKPuzzleWithoutMOCached(),
        json,
        "RLUB".split(""),
      );
    })())
  );
}

export async function preInitializeSkewb(): Promise<void> {
  await getCachedTrembleSolver();
}

function resetCenterOrientation(state: KState): KState {
  return new KState(state.kpuzzle, {
    CORNERS: state.stateData.CORNERS,
    CENTERS: {
      pieces: state.stateData.CENTERS.pieces,
      orientation: new Array(6).fill(0),
    },
  });
}

// TODO: fix def consistency.
export async function solveSkewb(state: KState): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(
    resetCenterOrientation(state),
    TREMBLE_DEPTH,
    (quantumMove: QuantumMove) => (quantumMove.family === "y" ? 4 : 3), // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}

export async function randomSkewbFixedCornerState(): Promise<KState> {
  // Note: this sets all center orientations to 0.
  return randomStateFromSGS(
    await (await dynamic).skewbKPuzzleWithoutMOCached(),
    await (await dynamic).sgsDataSkewbFixedCorner(),
  );
}

export async function randomSkewbFixedCornerScramble(): Promise<Alg> {
  return solveSkewb(await randomSkewbFixedCornerState());
}
