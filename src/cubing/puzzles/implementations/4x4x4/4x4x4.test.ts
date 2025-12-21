import { expect, test } from "bun:test";
import { cube4x4x4 } from ".";

test("`experimentalIsSolved(…)` for 4×4×4", async () => {
  const kpuzzle = await cube4x4x4.kpuzzle();

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
  expect(
    kpuzzle.defaultPattern().applyAlg("[[m: e], U]").experimentalIsSolved({
      ignorePuzzleOrientation: true,
      ignoreCenterOrientation: true,
    }),
  ).toBe(true);
});
