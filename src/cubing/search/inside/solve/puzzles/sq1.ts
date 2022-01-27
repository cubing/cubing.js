import { Alg } from "../../../../alg";

let cachedImport: Promise<
  typeof import("../../../../vendor/sq12phase/sq1-solver")
> | null = null;
function dynamicScrambleSq1(): Promise<
  typeof import("../../../../vendor/sq12phase/sq1-solver")
> {
  return (cachedImport ??= import("../../../../vendor/sq12phase/sq1-solver"));
}

export async function getRandomSquare1Scramble(): Promise<Alg> {
  return Alg.fromString(
    await (await dynamicScrambleSq1()).getRandomSquare1ScrambleString(),
  );
}
