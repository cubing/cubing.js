import { expect, test } from "bun:test";

import { kilominx } from "./";

test("Kilominx can apply x2", async () => {
  const kpuzzle = await kilominx.kpuzzle();
  expect(
    kpuzzle.algToTransformation("x2").isIdentityTransformation(),
  ).toBeFalse();
  expect(
    kpuzzle
      .algToTransformation("x2")
      .isIdentical(kpuzzle.algToTransformation("x2'")),
  ).toBeTrue();
});
