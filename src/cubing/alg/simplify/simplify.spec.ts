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

  it("cancels more complex algs correctly", () => {
    expect(
      new Alg("R3 M r").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("");
    expect(
      new Alg("U (y' U) U'").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("U (d) U'");
    expect(
      new Alg("(U U')").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("");
    expect(
      new Alg("L2 (U F)0 S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, F] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 [R, F] S");
    expect(
      new Alg("L2 [R, F F2'] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 [R, F'] S");
    expect(
      new Alg("L2 [R, F F'] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R R', F] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R,] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [, F] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, R] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, R'] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, R3] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, R2] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, r] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, L R2 L'] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R, L R2 R L'] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [,] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R: U U'] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 S");
    expect(
      new Alg("L2 [R R': U] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 U S");
    expect(
      new Alg("L2 [R R': F] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 f");
    expect(
      new Alg("L2 [R: r] S").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("L2 r S");
    expect(
      new Alg("U [R, r] [E: d']").simplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      }),
    ).to.be.identicalAlg("y");
  });
});
