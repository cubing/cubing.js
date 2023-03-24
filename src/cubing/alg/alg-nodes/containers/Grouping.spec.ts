import { Alg } from "../..";
import { expect } from "../../../../test/chai-workarounds";

describe("Grouping", () => {
  it("can invert a Square-1 tuple", () => {
    expect(new Alg("(5, 4)").invert().toString()).to.equal("(-5, -4)");
  });
});
