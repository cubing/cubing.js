import type { Alg } from "../../../../alg";
import type { KPuzzle } from "../../../../kpuzzle";
import { KState } from "../../../../kpuzzle/KState";
import { puzzles } from "../../../../puzzles";
import {
  randomPermute,
  randomUIntBelowFactory,
} from "../../../../vendor/random-uint-below";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";

// Empirical ly determined depth:
// - ≈11 moves on average (as opposed to >13 moves for depth 2),
// - in close to 40ms(on a MacBook Pro).
const TREMBLE_DEPTH = 3;

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgsCachedData: SGSCachedData = await (
        await import("./2x2x2.sgs.json")
      ).cachedData222();
      return new TrembleSolver(
        await puzzles["2x2x2"].kpuzzle(),
        sgsCachedData,
        "URFLBD".split(""),
      );
    })())
  );
}

export async function preInitialize222(): Promise<void> {
  await getCachedTrembleSolver();
}

// TODO: fix def consistency.
export async function solve222(state: KState): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(state, TREMBLE_DEPTH, () => 4); // TODO: Attach quantum move order lookup to puzzle.
  return alg;
}

// TODO: factor out and test.
async function mutatingRandomizeOrbit(
  kpuzzle: KPuzzle,
  orbitName: string,
  state: KState,
  options?: { orientationSum?: number },
): Promise<void> {
  const randomUIntBelow = await randomUIntBelowFactory();
  await randomPermute(state.stateData[orbitName].pieces);

  const orbitDef = kpuzzle.definition.orbits[orbitName];
  const ori = state.stateData[orbitName].orientation;

  let sum = 0;
  for (let i = 0; i < orbitDef.numPieces; i++) {
    const o = randomUIntBelow(orbitDef.orientations);
    ori[i] = o;
    sum += o;
  }

  // console.log("aaaa", options && "orientationSum" in options);
  if (options && "orientationSum" in options) {
    // console.log("sfdsf", options!.orientationSum),
    ori[0] =
      (((ori[0] + options.orientationSum! - sum) % orbitDef.orientations) +
        orbitDef.orientations) %
      orbitDef.orientations;
  }
}

// TODO: Use SGS?
export async function random222State(): Promise<KState> {
  const kpuzzle = await puzzles["2x2x2"].kpuzzle();
  const stateCopy: KState = new KState(
    kpuzzle,
    JSON.parse(JSON.stringify(kpuzzle.startState().stateData)),
  ); // TODO
  await mutatingRandomizeOrbit(kpuzzle, "CORNERS", stateCopy, {
    orientationSum: 0,
  });
  return stateCopy;
}

export async function random222Scramble(): Promise<Alg> {
  return await solve222(await random222State());
}
