import type { Alg } from "../../../../alg";
import type { KPuzzle } from "../../../../kpuzzle";
import { KState } from "../../../../kpuzzle";
import { cube2x2x2, puzzles } from "../../../../puzzles";
import { randomPermuteInPlace, randomUIntBelow } from "random-uint-below";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";
import { searchDynamicSideEvents } from "./dynamic/sgs-side-events";
import { solveTwsearch } from "../twsearch";

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
export async function solve222(state: KState): Promise<Alg> {
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
  return await solve222(await random222State());
}
