import { expect } from "../../test/chai-workarounds";

import { Alg } from "./Alg";
import { experimentalAppendMove } from "./operation";
import { Move } from "./alg-nodes";

describe("operation", () => {
  it("can append moves", () => {
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("U2")),
    ).to.be.identicalAlg(new Alg("R U R' U2"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R2'")),
    ).to.be.identicalAlg(new Alg("R U R' R2'"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R")),
    ).to.be.identicalAlg(new Alg("R U R' R"));
  });

  it("can coalesce appended moves", () => {
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("U2"), {
        coalesce: true,
      }),
    ).to.be.identicalAlg(new Alg("R U R' U2"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R2'"), {
        coalesce: true,
      }),
    ).to.be.identicalAlg(new Alg("R U R3'"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R"), {
        coalesce: true,
      }),
    ).to.be.identicalAlg(new Alg("R U"));
    expect(
      experimentalAppendMove(new Alg("r"), new Move("r"), { coalesce: true }),
    ).to.be.identicalAlg(new Alg("r2"));
  });

  it("mod 4 works as expected", () => {
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L"), {
        coalesce: true,
        puzzleSpecificAlgSimplificationInfo: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg(""));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L3"), {
        coalesce: true,
        puzzleSpecificAlgSimplificationInfo: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg("L2"));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L6"), {
        coalesce: true,
        puzzleSpecificAlgSimplificationInfo: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg("L"));
  });

  it("mod 3 works as expected", () => {
    expect(
      experimentalAppendMove(new Alg("L"), new Move("L"), {
        coalesce: true,
        puzzleSpecificAlgSimplificationInfo: { quantumMoveOrder: () => 3 },
      }),
    ).to.be.identicalAlg(new Alg("L'"));
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
