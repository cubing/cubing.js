import { expect, test } from "bun:test";
import { SKIP_SLOW_TESTS } from "../../../../test/SKIP_SLOW_TESTS.ts";
import { kilominx } from "./index.ts";

test.skipIf(SKIP_SLOW_TESTS)("Kilominx can apply x2", async () => {
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
