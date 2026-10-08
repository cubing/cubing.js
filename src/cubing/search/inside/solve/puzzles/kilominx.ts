import type { Alg } from "../../../../alg/index.ts";
import { mustBeInsideWorker } from "../../inside-worker.ts";
import { dynamicKilominxSolver } from "./dynamic/kilominx/index.ts";

export async function randomKilominxScramble(): Promise<Alg> {
  mustBeInsideWorker();
  return (await dynamicKilominxSolver).getRandomKilominxScramble();
}
