import type { Alg } from "../../../../alg";
import { addOrientationSuffix } from "../addOrientationSuffix";
import { random444Scramble } from "../../../../vendor/cstimer/src/js/scramble/scramble_444";
export {
  initialize as initialize444,
  random444Scramble,
} from "../../../../vendor/cstimer/src/js/scramble/scramble_444";

const randomSuffixes = [
  [null, "x", "x2", "x'", "z", "z'"],
  [null, "y", "y2", "y'"],
];

export async function random444OrientedScramble(): Promise<Alg> {
  return addOrientationSuffix(await random444Scramble(), randomSuffixes);
}
