import type { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";
import { dynamicKilominxSolver } from "./dynamic/kilominx";

export async function randomKilominxScramble(): Promise<Alg> {
  mustBeInsideWorker();
  return (await dynamicKilominxSolver).getRandomKilominxScramble();
}
