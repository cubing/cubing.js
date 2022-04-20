import type { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";
import { searchDynamicUnofficial } from "./dynamic/unofficial";

export async function randomRediCubeScramble(): Promise<Alg> {
  mustBeInsideWorker();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (await searchDynamicUnofficial).getRandomRediCubeScramble();
}
