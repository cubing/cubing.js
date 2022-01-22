import { Alg } from "../../../../alg";

let cachedImport: Promise<
  typeof import("../../../../vendor/sq12phase/scramble_sq1")
> | null = null;
function dynamicScrambleSq1(): Promise<
  typeof import("../../../../vendor/sq12phase/scramble_sq1")
> {
  return (cachedImport ??= import("../../../../vendor/sq12phase/scramble_sq1"));
}

export async function getRandomSquare1Scramble(): Promise<Alg> {
  return Alg.fromString(
    await (await dynamicScrambleSq1()).getRandomSquare1ScrambleString(),
  );
}
