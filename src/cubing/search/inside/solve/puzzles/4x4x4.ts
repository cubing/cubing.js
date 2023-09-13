import type { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";
import { addOrientationSuffix } from "../addOrientationSuffix";
import { dynamic4x4x4Solver } from "./dynamic/4x4x4";

const randomSuffixes = [
  [null, "x", "x2", "x'", "z", "z'"],
  [null, "y", "y2", "y'"],
];

export async function initialize444(): Promise<void> {
  return (await dynamic4x4x4Solver).initialize();
}

export async function random444Scramble(): Promise<Alg> {
  mustBeInsideWorker();
  return (await dynamic4x4x4Solver).random444Scramble();
}

export async function random444OrientedScramble(): Promise<Alg> {
  return addOrientationSuffix(await random444Scramble(), randomSuffixes);
}
