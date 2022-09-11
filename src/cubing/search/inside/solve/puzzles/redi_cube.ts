import type { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";
import { searchDynamicUnofficial } from "./dynamic/sgs-unofficial";

export async function randomRediCubeScramble(): Promise<Alg> {
  mustBeInsideWorker();
  return (await searchDynamicUnofficial).getRandomRediCubeScramble();
}
