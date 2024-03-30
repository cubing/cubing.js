import { randomPermuteInPlace, randomUIntBelow } from "random-uint-below";
import type { Alg } from "../../../../alg";
import type { KPuzzle } from "../../../../kpuzzle";
import { KPattern } from "../../../../kpuzzle";
import { cube2x2x2, puzzles } from "../../../../puzzles";
import { mustBeInsideWorker } from "../../inside-worker";
import type { SGSCachedData } from "../parseSGS";
import { TrembleSolver } from "../tremble";
import { wasmTwsearch } from "../twsearch";
import { searchDynamicSideEvents } from "./dynamic/sgs-side-events";

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
export async function solve222(pattern: KPattern): Promise<Alg> {
  mustBeInsideWorker();
  return wasmTwsearch((await cube2x2x2.kpuzzle()).definition, pattern, {
    generatorMoves: "UFLR".split(""),
  });
}

// TODO: factor out and test.
function mutatingRandomizeOrbit(
  kpuzzle: KPuzzle,
  orbitName: string,
  pattern: KPattern,
  options?: { orientationSum?: number },
): void {
  randomPermuteInPlace(pattern.patternData[orbitName].pieces);

  const orbitDefinition = kpuzzle.lookupOrbitDefinition(orbitName);
  const ori = pattern.patternData[orbitName].orientation;

  let sum = 0;
  for (let i = 0; i < orbitDefinition.numPieces; i++) {
    const o = randomUIntBelow(orbitDefinition.numOrientations);
    ori[i] = o;
    sum += o;
  }

  // console.log("aaaa", options && "orientationSum" in options);
  if (options && "orientationSum" in options) {
    // console.log("sfdsf", options!.orientationSum),
    ori[0] =
      (((ori[0] + options.orientationSum! - sum) %
        orbitDefinition.numOrientations) +
        orbitDefinition.numOrientations) %
      orbitDefinition.numOrientations;
  }
}

// TODO: Use SGS?
export async function random222Pattern(): Promise<KPattern> {
  const kpuzzle = await puzzles["2x2x2"].kpuzzle();
  const patternCopy: KPattern = new KPattern(
    kpuzzle,
    structuredClone(kpuzzle.defaultPattern().patternData),
  ); // TODO
  mutatingRandomizeOrbit(kpuzzle, "CORNERS", patternCopy, {
    orientationSum: 0,
  });
  return patternCopy;
}
