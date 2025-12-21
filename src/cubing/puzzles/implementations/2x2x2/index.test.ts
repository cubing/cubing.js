import { expect, test } from "bun:test";

import { cube2x2x2 } from "../../../puzzles";

test("`experimentalIsSolved(…)` for 2x2x2", async () => {
  const kpuzzle = await cube2x2x2.kpuzzle();

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
  ).toBe(true);

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
});
