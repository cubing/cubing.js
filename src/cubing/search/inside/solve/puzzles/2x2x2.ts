import type { Alg } from "../../../../alg";
import type { KPuzzle } from "../../../../kpuzzle";
import { KState } from "../../../../kpuzzle";
import { cube2x2x2, puzzles } from "../../../../puzzles";
import { randomPermuteInPlace, randomUIntBelow } from "random-uint-below";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";
import { searchDynamicSideEvents } from "./dynamic/sgs-side-events";
import { solveTwsearch, twsearchPromise } from "../twsearch";
import { experimentalNormalize2x2x2Orientation } from "../../../../puzzles/cubing-private";

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      const sgsCachedData: SGSCachedData = await (
        await searchDynamicSideEvents
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
export async function solve222HTMOptimal(
  state: KState,
  maxDepth: number = 11,
): Promise<Alg> {
  mustBeInsideWorker();
  const { normalizedState, normalizationAlg } =
    experimentalNormalize2x2x2Orientation(state);
  const orientedResult = await solveTwsearch(
    (
      await cube2x2x2.kpuzzle()
    ).definition,
    normalizedState.experimentalToTransformation()!.transformationData,
    {
      moveSubset: "UFLR".split(""), // TODO: <U, F, R>
      maxDepth,
    },
  );
  return normalizationAlg.concat(orientedResult);
}

async function hasHTMSolutionWithFewerMoves(
  state: KState,
  filterMin: number,
): Promise<boolean> {
  try {
    (await solve222HTMOptimal(state, filterMin - 1)).log();
    return true;
  } catch (e) {
    if (e instanceof (await twsearchPromise).NoSolutionError) {
      return false;
    }
    throw e;
  }
}

// TODO: fix def consistency.
export async function solve222ForScramble(state: KState): Promise<Alg> {
  mustBeInsideWorker();
  return solveTwsearch(
    (await cube2x2x2.kpuzzle()).definition,
    state.experimentalToTransformation()!.transformationData,
    {
      moveSubset: "UFLR".split(""),
      minDepth: 11,
    },
  );
}

// TODO: factor out and test.
function mutatingRandomizeOrbit(
  kpuzzle: KPuzzle,
  orbitName: string,
  state: KState,
  options?: { orientationSum?: number },
): void {
  randomPermuteInPlace(state.stateData[orbitName].pieces);

  const orbitDef = kpuzzle.definition.orbits[orbitName];
  const ori = state.stateData[orbitName].orientation;

  let sum = 0;
  for (let i = 0; i < orbitDef.numPieces; i++) {
    const o = randomUIntBelow(orbitDef.numOrientations);
    ori[i] = o;
    sum += o;
  }

  // console.log("aaaa", options && "orientationSum" in options);
  if (options && "orientationSum" in options) {
    // console.log("sfdsf", options!.orientationSum),
    ori[0] =
      (((ori[0] + options.orientationSum! - sum) % orbitDef.numOrientations) +
        orbitDef.numOrientations) %
      orbitDef.numOrientations;
  }
}

// TODO: Use SGS?
export async function random222State(): Promise<KState> {
  const kpuzzle = await puzzles["2x2x2"].kpuzzle();
  const stateCopy: KState = new KState(
    kpuzzle,
    JSON.parse(JSON.stringify(kpuzzle.startState().stateData)),
  ); // TODO
  mutatingRandomizeOrbit(kpuzzle, "CORNERS", stateCopy, {
    orientationSum: 0,
  });
  return stateCopy;
}

export async function random222Scramble(): Promise<Alg> {
  let state = await random222State();
  while (await hasHTMSolutionWithFewerMoves(state, 4)) {
    console.info("Filtered out a 2x2x2 state!");
    state = await random222State();
  }
  return (await solve222ForScramble(state)).invert(); // Note: Inversion is not needed for randomness, but it is more consistent with other code.
}
