import { expect, test } from "bun:test";
import { cube5x5x5 } from ".";

test("`experimentalIsSolved(…)` for 5×5×5", async () => {
  const kpuzzle = await cube5x5x5.kpuzzle();

  expect(
    kpuzzle.defaultPattern().experimentalIsSolved({
      ignorePuzzleOrientation: true,
      ignoreCenterOrientation: true,
    }),
  ).toBe(true);

  expect(
    kpuzzle.defaultPattern().applyAlg("R").experimentalIsSolved({
      ignorePuzzleOrientation: true,
      ignoreCenterOrientation: true,
    }),
  ).toBe(false);

  expect(
    kpuzzle.defaultPattern().applyAlg("U2 D2").experimentalIsSolved({
      ignorePuzzleOrientation: true,
      ignoreCenterOrientation: true,
    }),
  ).toBe(false);

  expect(
    kpuzzle.defaultPattern().applyAlg("U2 D2").experimentalIsSolved({
      ignorePuzzleOrientation: false,
      ignoreCenterOrientation: true,
    }),
  ).toBe(false);

  expect(
    kpuzzle.defaultPattern().applyAlg("x y").experimentalIsSolved({
      ignorePuzzleOrientation: true,
      ignoreCenterOrientation: true,
    }),
  ).toBe(true);

  expect(
    kpuzzle.defaultPattern().applyAlg("x y").experimentalIsSolved({
      ignorePuzzleOrientation: false,
      ignoreCenterOrientation: true,
    }),
  ).toBe(false);

  expect(
    kpuzzle.defaultPattern().applyAlg("(R' U' R U')5").experimentalIsSolved({
      ignorePuzzleOrientation: true,
      ignoreCenterOrientation: true,
    }),
  ).toBe(true);
});
