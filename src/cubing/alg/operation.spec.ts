import { expect } from "../../test/chai-workaround";

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
        sameDirection: true,
        oppositeDirection: true,
      }),
    ).to.be.identicalAlg(new Alg("R U R' U2"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R2'"), {
        sameDirection: true,
        oppositeDirection: true,
      }),
    ).to.be.identicalAlg(new Alg("R U R3'"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R"), {
        sameDirection: true,
        oppositeDirection: true,
      }),
    ).to.be.identicalAlg(new Alg("R U"));
    expect(
      experimentalAppendMove(new Alg("r"), new Move("r"), {
        sameDirection: true,
        oppositeDirection: true,
      }),
    ).to.be.identicalAlg(new Alg("r2"));
  });

  it("mod 4 works as expected", () => {
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L"), {
        sameDirection: true,
        oppositeDirection: true,
        quantumMoveOrder: 4,
      }),
    ).to.be.identicalAlg(new Alg(""));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L3"), {
        sameDirection: true,
        oppositeDirection: true,
        quantumMoveOrder: 4,
      }),
    ).to.be.identicalAlg(new Alg("L2"));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L6"), {
        sameDirection: true,
        oppositeDirection: true,
        quantumMoveOrder: 4,
      }),
    ).to.be.identicalAlg(new Alg("L"));
  });

  it("mod 3 works as expected", () => {
    expect(
      experimentalAppendMove(new Alg("L"), new Move("L"), {
        sameDirection: true,
        oppositeDirection: true,
        quantumMoveOrder: 3,
      }),
    ).to.be.identicalAlg(new Alg("L'"));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L3"), {
        sameDirection: true,
        oppositeDirection: true,
        quantumMoveOrder: 3,
      }),
    ).to.be.identicalAlg(new Alg(""));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L6"), {
        sameDirection: true,
        oppositeDirection: true,
        quantumMoveOrder: 3,
      }),
    ).to.be.identicalAlg(new Alg(""));
  });

  it("wide moves not processed by default", () => {
    expect(
      experimentalAppendMove(new Alg("L"), new Move("x")),
    ).to.be.identicalAlg(new Alg("L x"));
  });

  it("wide moves", () => {
    expect(
      experimentalAppendMove(new Alg("L"), new Move("x"), {
        wideMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("r"));
    expect(
      experimentalAppendMove(new Alg("L'"), new Move("x'"), {
        wideMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("r'"));
    expect(
      experimentalAppendMove(new Alg("R"), new Move("x'"), {
        wideMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("l"));
    expect(
      experimentalAppendMove(new Alg("R"), new Move("x"), {
        wideMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("R x"));
    expect(
      experimentalAppendMove(new Alg("R'"), new Move("x"), {
        wideMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("l'"));
    expect(
      experimentalAppendMove(new Alg("R' R"), new Move("x"), {
        wideMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("R' R x"));
  });

  it("slice moves", () => {
    expect(
      experimentalAppendMove(new Alg("R' R"), new Move("x"), {
        wideMoves333: true,
        sliceMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("R' R x"));
    expect(
      experimentalAppendMove(new Alg("L' R"), new Move("x'"), {
        wideMoves333: true,
        sliceMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("M"));
    expect(
      experimentalAppendMove(new Alg("L R'"), new Move("x"), {
        wideMoves333: true,
        sliceMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("M'"));
    expect(
      experimentalAppendMove(new Alg("L' R"), new Move("x"), {
        wideMoves333: true,
        sliceMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("L' R x"));
    expect(
      experimentalAppendMove(new Alg("U' D"), new Move("y"), {
        wideMoves333: true,
        sliceMoves333: true,
      }),
    ).to.be.identicalAlg(new Alg("E'"));
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
