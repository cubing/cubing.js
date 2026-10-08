import type { Alg } from "../../../../alg/index.ts";
import { mustBeInsideWorker } from "../../inside-worker.ts";
import { searchDynamicUnofficial } from "./dynamic/sgs-unofficial/index.ts";

export async function randomRediCubeScramble(): Promise<Alg> {
  mustBeInsideWorker();
  return (await searchDynamicUnofficial).getRandomRediCubeScramble();
}
