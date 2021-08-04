import type { Alg } from "../../../../alg";
import { addOrientationSuffix } from "../addOrientationSuffix";
import { bigCubeRandomMoves } from "./big-cubes";

const randomSuffixes = [
  [null, "3Rw", "3Rw2", "3Rw'", "3Fw", "3Fw'"],
  [null, "3Dw", "3Dw2", "3Dw'"],
];

export async function oriented555RandomMoves(): Promise<Alg> {
  return addOrientationSuffix(await bigCubeRandomMoves(5), randomSuffixes);
}
