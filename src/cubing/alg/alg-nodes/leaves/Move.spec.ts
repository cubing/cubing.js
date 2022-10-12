import { expect } from "../../../../test/chai-workarounds";

import { Move } from "./Move";

describe("Move", () => {
  it("can be modified", () => {
    expect(new Move("R").modified({ amount: 2 }).toString()).to.equal("R2");
    expect(
      new Move("4r", 3)
        .modified({
          family: "u",
          outerLayer: 2,
        })
        .toString(),
    ).to.equal("2-4u3");
  });
});
