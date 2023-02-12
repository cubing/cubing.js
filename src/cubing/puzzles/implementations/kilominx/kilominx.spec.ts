import { expect } from "../../../../test/chai-workarounds";

import { kilominx } from "./";

describe("Kilominx", () => {
  it("can apply x2", async () => {
    const kpuzzle = await kilominx.kpuzzle();
    expect(kpuzzle.algToTransformation("x2").isIdentityTransformation()).to.be
      .false;
    expect(
      kpuzzle
        .algToTransformation("x2")
        .isIdentical(kpuzzle.algToTransformation("x2'")),
    ).to.be.true;
  });
});
