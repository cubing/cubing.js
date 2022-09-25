import { expect } from "../../../test/chai-workarounds";

import { cube3x3x3 } from "../../puzzles";
import { Alg } from "../Alg";

describe("simplify", () => {
  it("can cancel", () => {
    expect(
      new Alg("R R2'").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R'");
    expect(
      new Alg("R R2'").simplify({
        cancel: { directional: "any-direction" },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R'");
    expect(
      new Alg("R R7'").simplify({
        cancel: { directional: "any-direction", puzzleSpecificModWrap: "none" },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R6'");
  });

  it("can avoid cancelling", () => {
    expect(
      new Alg("R R2'").simplify({
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R R2");
    expect(
      new Alg("R R2'").simplify({
        cancel: {
          puzzleSpecificModWrap: "gravity",
        },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R R2'");
    expect(
      new Alg("R R2'").simplify({
        cancel: false,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R R2");
    expect(
      new Alg("R R2'").simplify({
        cancel: {},
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R R2");
    expect(
      new Alg("R R2'").simplify({
        cancel: { directional: "same-direction" },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R R2");
    expect(
      new Alg("R R2'").simplify({
        cancel: {
          directional: "same-direction",
          puzzleSpecificModWrap: "gravity",
        },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("R R2'");
  });
});

describe("simplify", () => {
  it("handles mod wrap field", () => {
    expect(
      new Alg(
        "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
      ).simplify({
        cancel: {
          puzzleSpecificModWrap: "canonical-centered",
        },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(
      ". R . R2 . R' . . R . R2 . R' . R . R2 . R' . . R . R2 . R' .",
    );
    expect(
      new Alg(
        "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
      ).simplify({
        cancel: {
          puzzleSpecificModWrap: "none",
        },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(
      "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
    );
    expect(
      new Alg(
        "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
      ).simplify({
        cancel: {
          puzzleSpecificModWrap: "gravity",
        },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(
      ". R . R2' . R' . . R . R2' . R' . R . R2 . R' . . R . R2 . R' .",
    );
    expect(
      new Alg(
        "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
      ).simplify({
        cancel: {
          puzzleSpecificModWrap: "canonical-positive",
        },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(
      ". R . R2 . R3 . . R . R2 . R3 . R . R2 . R3 . . R . R2 . R3 .",
    );
    expect(
      new Alg(
        "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
      ).simplify({
        cancel: {
          puzzleSpecificModWrap: "preserve-sign",
        },
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg(
      ". R3' . R2' . R' . . R3' . R2' . R' . R . R2 . R3 . . R . R2 . R3 .",
    );
  });
});
