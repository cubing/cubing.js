import { expect, use } from "../../test/chai-workaround";

import { Alg } from "./Alg";
import { experimentalAppendMove } from "./operation";
import { Move } from "./alg-nodes";

use(function (chai, utils) {
  chai.Assertion.overwriteMethod("equal", function (_super) {
    return function compareAlgs(other: any) {
      const obj = this._obj;
      if (obj && obj instanceof Alg) {
        const actualString = obj.toString();
        const expectedString = other.toString();
        expect(actualString).to.equal(expectedString);
        expect(obj.isIdentical(other));
      } else {
        _super.apply(this, arguments);
      }
    };
  });
});

describe("operation", () => {
  it("can append moves", () => {
    expect(experimentalAppendMove(new Alg("R U R'"), new Move("U2"))).to.equal(
      new Alg("R U R' U"),
    );
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

  it("computes mod offsets correctly", () => {
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L"), {
        coalesce: true,
        mod: 4,
      }).isIdentical(new Alg("")),
    ).to.be.true;
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L3"), {
        coalesce: true,
        mod: 4,
      }).isIdentical(new Alg("L2")),
    ).to.be.true;
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L6"), {
        coalesce: true,
        mod: 4,
      }).isIdentical(new Alg("L")),
    ).to.be.true;
    expect(
      experimentalAppendMove(new Alg("L"), new Move("L"), {
        coalesce: true,
        mod: 3,
      }).isIdentical(new Alg("L'")),
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
