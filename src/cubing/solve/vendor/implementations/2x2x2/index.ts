import type { Alg } from "../../../../alg";
import {
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../../kpuzzle";
import { puzzles } from "../../../../puzzles";
import { mustBeInsideWorker } from "../../../inside/inside-worker";
import {
  randomPermute,
  randomUIntBelowFactory,
} from "../vendor/random-uint-below";
import type { SGSCachedData } from "../vendor/sgs/src/sgs";
import { TrembleSolver } from "../vendor/sgs/src/tremble";
import { simplify222Alg } from "./simplify222Alg";

let cachedTrembleSolver: Promise<TrembleSolver> | null = null;
async function getCachedTrembleSolver(): Promise<TrembleSolver> {
  return (
    cachedTrembleSolver ||
    (cachedTrembleSolver = (async (): Promise<TrembleSolver> => {
      // TODO: fix assignment bug that prevents extensions.
      const nonExtensibleDef = await puzzles["2x2x2"].def();
      const def = JSON.parse(JSON.stringify(nonExtensibleDef)); // TODO: perf
      // TODO: Allow reducing moves.
      delete def.moves.x;
      delete def.moves.y;
      delete def.moves.z;
      // TODO: reduce size of JSON.
      // TODO: this technically doesn't use the same definition as cubing.js 2x2x2.
      const json: SGSCachedData = await (
        await import("../vendor/sgs/src/test/puzzles/2x2x2.sgs.json")
      ).cachedData222();
      // console.log(json)
      return new TrembleSolver(def, json);
    })())
  );
}

export async function preInitialize222(): Promise<void> {
  await getCachedTrembleSolver();
}

// TODO: fix def consistency.
export async function solve222(state: Transformation): Promise<Alg> {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver();
  const alg = await trembleSolver.solve(state, 3);
  return simplify222Alg(alg);
}

// TODO: factor out and test.
async function randomizeOrbit(
  def: KPuzzleDefinition,
  orbitName: string,
  state: Transformation,
  options?: { orientationSum?: number },
): Promise<void> {
  const randomUIntBelow = await randomUIntBelowFactory();
  await randomPermute(state[orbitName].permutation);

  const orbitDef = def.orbits[orbitName];
  const ori = state[orbitName].orientation;

  let sum = 0;
  for (let i = 0; i < orbitDef.numPieces; i++) {
    const o = await randomUIntBelow(orbitDef.orientations);
    ori[i] = o;
    sum += o;
  }

  // console.log("aaaa", options && "orientationSum" in options);
  if (options && "orientationSum" in options) {
    // console.log("sfdsf", options!.orientationSum),
    ori[0] =
      (((ori[0] + options!.orientationSum! - sum) % orbitDef.orientations) +
        orbitDef.orientations) %
      orbitDef.orientations;
  }
}

export async function random222State(): Promise<Transformation> {
  const nonExtensibleDef = await puzzles["2x2x2"].def();
  const def = Object.assign({}, nonExtensibleDef);
  const kpuzzle = new KPuzzle(def);
  const stateCopy = JSON.parse(JSON.stringify(kpuzzle.state)); // TODO
  await randomizeOrbit(def, "CORNERS", stateCopy, { orientationSum: 0 });
  return stateCopy;
}

export async function random222Scramble(): Promise<Alg> {
  return await solve222(await random222State());
}
