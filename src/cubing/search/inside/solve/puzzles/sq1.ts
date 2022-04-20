import { Alg } from "../../../../alg";
import { dynamicSq1Solver } from "./dynamic/sq1";

export async function getRandomSquare1Scramble(): Promise<Alg> {
  return Alg.fromString(
    await (await dynamicSq1Solver).getRandomSquare1ScrambleString(),
  );
}
