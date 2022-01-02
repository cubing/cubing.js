import { Alg } from "../../../../alg";
import { getRandomSquare1ScrambleString } from "../../../../vendor/sq12phase/scramble_sq1";

export async function getRandomSquare1Scramble(): Promise<Alg> {
  return Alg.fromString(await getRandomSquare1ScrambleString());
}
