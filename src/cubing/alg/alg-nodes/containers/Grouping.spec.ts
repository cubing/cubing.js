import { Alg, Grouping } from "../..";
import { expect } from "../../../../test/chai-workarounds";

describe("Grouping", () => {
  it("can invert a Square-1 tuple", () => {
    expect(new Alg("(5, 4)").invert().toString()).to.equal("(-5, -4)");
  });
  it("doesn't crash for a Square-1 tuple with a non-1 amount", () => {
    const alg = new Alg("(5, 4)");
    const grouping = alg.childAlgNodes().next().value;
    expect(new Grouping(grouping.alg, -1).toString()).to.equal(
      "(U_SQ_5 D_SQ_4)'",
    );
    expect(new Grouping(grouping.alg, 2).toString()).to.equal(
      "(U_SQ_5 D_SQ_4)2",
    );
    expect(new Grouping(grouping.alg, -7).toString()).to.equal(
      "(U_SQ_5 D_SQ_4)7'",
    );
  });
  it("collapses conjugates and commutators", () => {
    expect(new Alg("([R, F])2").toString()).to.equal("[R, F]2");
    expect(new Alg("([R: F])2").toString()).to.equal("[R: F]2");
    expect(new Alg("([R: F] U)2").toString()).to.equal("([R: F] U)2");
  });
});
