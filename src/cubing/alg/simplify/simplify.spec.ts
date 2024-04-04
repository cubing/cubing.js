import { expect, test } from "bun:test";

import { cube3x3x3 } from "../../puzzles";
import { Alg } from "../Alg";

test("can cancel", () => {
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R'")),
  ).toBeTrue();
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        cancel: { directional: "any-direction" },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R'")),
  ).toBeTrue();
  expect(
    new Alg("R R7'")
      .experimentalSimplify({
        cancel: { directional: "any-direction", puzzleSpecificModWrap: "none" },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R6'")),
  ).toBeTrue();
});

test("can avoid cancelling", () => {
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R R2")),
  ).toBeTrue();
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        cancel: {
          puzzleSpecificModWrap: "gravity",
        },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R R2'")),
  ).toBeTrue();
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        cancel: false,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R R2")),
  ).toBeTrue();
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        cancel: {},
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R R2")),
  ).toBeTrue();
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        cancel: { directional: "same-direction" },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R R2'")),
  ).toBeTrue();
  expect(
    new Alg("R R2'")
      .experimentalSimplify({
        cancel: {
          directional: "same-direction",
          puzzleSpecificModWrap: "gravity",
        },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("R R2'")),
  ).toBeTrue();
});

test("handles mod wrap field", () => {
  expect(
    new Alg(
      "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
    )
      .experimentalSimplify({
        cancel: {
          puzzleSpecificModWrap: "canonical-centered",
        },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(
        new Alg(
          ". R . R2 . R' . . R . R2 . R' . R . R2 . R' . . R . R2 . R' .",
        ),
      ),
  ).toBeTrue();
  expect(
    new Alg(
      "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
    )
      .experimentalSimplify({
        cancel: {
          puzzleSpecificModWrap: "none",
        },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(
        new Alg(
          "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
        ),
      ),
  ).toBeTrue();
  expect(
    new Alg(
      "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
    )
      .experimentalSimplify({
        cancel: {
          puzzleSpecificModWrap: "gravity",
        },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(
        new Alg(
          ". R . R2' . R' . . R . R2' . R' . R . R2 . R' . . R . R2 . R' .",
        ),
      ),
  ).toBeTrue();
  expect(
    new Alg(
      "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
    )
      .experimentalSimplify({
        cancel: {
          puzzleSpecificModWrap: "canonical-positive",
        },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(
        new Alg(
          ". R . R2 . R3 . . R . R2 . R3 . R . R2 . R3 . . R . R2 . R3 .",
        ),
      ),
  ).toBeTrue();
  expect(
    new Alg(
      "R8' . R7' . R6' . R5' . R4' . R3' . R2' . R' . R . R2 . R3 . R4 . R5 . R6 . R7 . R8",
    )
      .experimentalSimplify({
        cancel: {
          puzzleSpecificModWrap: "preserve-sign",
        },
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(
        new Alg(
          ". R3' . R2' . R' . . R3' . R2' . R' . R . R2 . R3 . . R . R2 . R3 .",
        ),
      ),
  ).toBeTrue();
});

test("cancels more complex algs correctly", () => {
  expect(
    new Alg("R3 M r")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("")),
  ).toBeTrue();
  expect(
    new Alg("U (y' U) U'")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("U (d) U'")),
  ).toBeTrue();
  expect(
    new Alg("(U U')")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("")),
  ).toBeTrue();
  expect(
    new Alg("L2 (U F)0 S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, F] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 [R, F] S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, F F2'] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 [R, F'] S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, F F'] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R R', F] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R,] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [, F] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, R] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, R'] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, R3] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, R2] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, r] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, L R2 L'] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R, L R2 R L'] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [,] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R: U U'] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R R': U] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 U S")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R R': F] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 f")),
  ).toBeTrue();
  expect(
    new Alg("L2 [R: r] S")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("L2 r S")),
  ).toBeTrue();
  expect(
    new Alg("U [R, r] [E: d']")
      .experimentalSimplify({
        cancel: true,
        puzzleLoader: cube3x3x3,
      })
      .isIdentical(new Alg("y")),
  ).toBeTrue();
});
