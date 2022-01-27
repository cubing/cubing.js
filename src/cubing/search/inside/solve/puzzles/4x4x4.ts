import type { Alg } from "../../../../alg";
import { addOrientationSuffix } from "../addOrientationSuffix";

const randomSuffixes = [
  [null, "x", "x2", "x'", "z", "z'"],
  [null, "y", "y2", "y'"],
];

let cachedImport: Promise<
  typeof import("../../../../vendor/cstimer/src/js/scramble/444-solver")
> | null = null;
function dynamicScramble444(): Promise<
  typeof import("../../../../vendor/cstimer/src/js/scramble/444-solver")
> {
  return (cachedImport ??= import(
    "../../../../vendor/cstimer/src/js/scramble/444-solver"
  ));
}

export async function initialize444(): Promise<void> {
  return (await dynamicScramble444()).initialize();
}

export async function random444Scramble(): Promise<Alg> {
  return (await dynamicScramble444()).random444Scramble();
}

export async function random444OrientedScramble(): Promise<Alg> {
  return addOrientationSuffix(await random444Scramble(), randomSuffixes);
}
