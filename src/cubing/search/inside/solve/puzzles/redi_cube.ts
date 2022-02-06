import type { Alg } from "../../../../alg";
import { mustBeInsideWorker } from "../../inside-worker";

export async function randomRediCubeScramble(): Promise<Alg> {
  mustBeInsideWorker();
  const { getRandomRediCubeScramble } = await import(
    "../../../../vendor/xyzzy/redi_cube"
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return getRandomRediCubeScramble();
}
