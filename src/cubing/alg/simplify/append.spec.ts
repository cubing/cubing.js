import { expect } from "../../../test/chai-workarounds";

import { Alg } from "../Alg";
import { experimentalAppendMove } from "./append";
import { Move } from "../alg-nodes";
import { cube3x3x3 } from "../../puzzles";

describe("append", () => {
  it("can append moves", () => {
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("U2"), {
        cancel: { directional: "none" },
      }),
    ).to.be.identicalAlg(new Alg("R U R' U2"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R2'"), {
        cancel: { directional: "none" },
      }),
    ).to.be.identicalAlg(new Alg("R U R' R2'"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R"), {
        cancel: { directional: "none" },
      }),
    ).to.be.identicalAlg(new Alg("R U R' R"));
  });

  it("can cancel appended moves", () => {
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("U2"), {
        cancel: true,
      }),
    ).to.be.identicalAlg(new Alg("R U R' U2"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R2'"), {
        cancel: true,
      }),
    ).to.be.identicalAlg(new Alg("R U R3'"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R"), {
        cancel: true,
      }),
    ).to.be.identicalAlg(new Alg("R U"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R'"), {
        cancel: true,
      }),
    ).to.be.identicalAlg(new Alg("R U R2'"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R'"), {
        cancel: true,
        puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg("R U R2"));
    expect(
      experimentalAppendMove(new Alg("R U R'"), new Move("R'"), {
        cancel: {
          directional: "any-direction",
          puzzleSpecificModWrap: "gravity",
        },
        puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg("R U R2'"));
    expect(
      experimentalAppendMove(new Alg("r"), new Move("r"), {
        cancel: true,
      }),
    ).to.be.identicalAlg(new Alg("r2"));
  });

  it("mod 4 works as expected", () => {
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L"), {
        cancel: true,
        puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg(""));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L3"), {
        cancel: true,
        puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg("L2"));
    expect(
      experimentalAppendMove(new Alg("L3"), new Move("L6"), {
        cancel: true,
        puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
      }),
    ).to.be.identicalAlg(new Alg("L"));
  });

  it("mod 3 works as expected", () => {
    expect(
      experimentalAppendMove(new Alg("L"), new Move("L"), {
        cancel: true,
        puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 3 },
      }),
    ).to.be.identicalAlg(new Alg("L'"));
  });

  it("handles same-direction correctly", () => {
    expect(
      experimentalAppendMove(new Alg("R'"), new Move("R"), {
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(new Alg(""));
    expect(
      experimentalAppendMove(new Alg("R'"), new Move("R"), {
        cancel: { directional: "same-direction" },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(new Alg("R' R"));
    expect(
      experimentalAppendMove(new Alg("R' M'"), new Move("R"), {
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(new Alg("M'"));
    expect(
      experimentalAppendMove(new Alg("R' M'"), new Move("R"), {
        cancel: { directional: "same-direction" },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(new Alg("R' r"));
  });
});
