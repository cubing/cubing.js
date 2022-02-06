import type { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";

export async function randomKilominxScramble(): Promise<Alg> {
  mustBeInsideWorker();
  const { getRandomKilominxScramble } = await import(
    "../../../../vendor/xyzzy/kilosolver"
  );
  return getRandomKilominxScramble();
}
