import { Alg } from "../../../../alg/index.ts";
import { dynamicSq1Solver } from "./dynamic/sq1/index.ts";

export async function getRandomSquare1Scramble(): Promise<Alg> {
  return Alg.fromString(
    await (await dynamicSq1Solver).getRandomSquare1ScrambleString(),
  );
}
