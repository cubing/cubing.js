import { expect } from "../../test/chai-workaround";

import { Alg } from "./Alg";
import { experimentalAppendMove } from "./operation";
import { Move } from "./alg-nodes";

describe("operation", () => {
  it("can append moves", () => {
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("U2")).isIdentical(
        new Alg("R U R' U2"),
      ),
    ).to.be.true;
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R", -2)).isIdentical(
        new Alg("R U R' R2'"),
      ),
    ).to.be.true;
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R")).isIdentical(
        new Alg("R U R' R"),
      ),
    ).to.be.true;
  });

  it("can coalesce appended moves", () => {
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("U2"), {
        coalesce: true,
      }).isIdentical(new Alg("R U R' U2")),
    ).to.be.true;
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R", -2), {
        coalesce: true,
      }).isIdentical(new Alg("R U R3'")),
    ).to.be.true;
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R"), {
        coalesce: true,
      }).isIdentical(new Alg("R U")),
    ).to.be.true;
  });

  it("can concat algs", () => {
    expect(
      new Alg("R U2").concat(new Alg("F' D")).isIdentical(new Alg("R U2 F' D")),
    ).to.be.true;
    expect(
      Array.from(new Alg("R U2").concat(new Alg("U R'")).childAlgNodes())
        .length,
    ).to.equal(4);
    expect(
      new Alg("R U2").concat(new Alg("U R'")).isIdentical(new Alg("R U2 U R'")),
    ).to.be.true;
  });
});
