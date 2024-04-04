import { expect, test } from "bun:test";

import { cube3x3x3 } from "../../puzzles";
import { Alg } from "../Alg";
import { Move } from "../alg-nodes";
import { experimentalAppendMove } from "./append";

test("can append moves", () => {
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("U2"), {
      cancel: { directional: "none" },
    }).isIdentical(new Alg("R U R' U2")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("R2'"), {
      cancel: { directional: "none" },
    }).isIdentical(new Alg("R U R' R2'")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("R"), {
      cancel: { directional: "none" },
    }).isIdentical(new Alg("R U R' R")),
  ).toBeTrue();
});

test("can cancel appended moves", () => {
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("U2"), {
      cancel: true,
    }).isIdentical(new Alg("R U R' U2")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("R2'"), {
      cancel: true,
    }).isIdentical(new Alg("R U R3'")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("R"), {
      cancel: true,
    }).isIdentical(new Alg("R U")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("R'"), {
      cancel: true,
    }).isIdentical(new Alg("R U R2'")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("R'"), {
      cancel: true,
      puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
    }).isIdentical(new Alg("R U R2")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R U R'"), new Move("R'"), {
      cancel: {
        directional: "any-direction",
        puzzleSpecificModWrap: "gravity",
      },
      puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
    }).isIdentical(new Alg("R U R2'")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("r"), new Move("r"), {
      cancel: true,
    }).isIdentical(new Alg("r2")),
  ).toBeTrue();
});

test("mod 4 works as expected", () => {
  expect(
    experimentalAppendMove(new Alg("L3"), new Move("L"), {
      cancel: true,
      puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
    }).isIdentical(new Alg("")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("L3"), new Move("L3"), {
      cancel: true,
      puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
    }).isIdentical(new Alg("L2")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("L3"), new Move("L6"), {
      cancel: true,
      puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 4 },
    }).isIdentical(new Alg("L")),
  ).toBeTrue();
});

test("mod 3 works as expected", () => {
  expect(
    experimentalAppendMove(new Alg("L"), new Move("L"), {
      cancel: true,
      puzzleSpecificSimplifyOptions: { quantumMoveOrder: () => 3 },
    }).isIdentical(new Alg("L'")),
  ).toBeTrue();
});

test("handles same-direction correctly", () => {
  expect(
    experimentalAppendMove(new Alg("R'"), new Move("R"), {
      cancel: true,
      puzzleLoader: cube3x3x3,
    }).isIdentical(new Alg("")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R'"), new Move("R"), {
      cancel: { directional: "same-direction" },
      puzzleLoader: cube3x3x3,
    }).isIdentical(new Alg("R' R")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R' M'"), new Move("R"), {
      cancel: true,
      puzzleLoader: cube3x3x3,
    }).isIdentical(new Alg("M'")),
  ).toBeTrue();
  expect(
    experimentalAppendMove(new Alg("R' M'"), new Move("R"), {
      cancel: { directional: "same-direction" },
      puzzleLoader: cube3x3x3,
    }).isIdentical(new Alg("R' r")),
  ).toBeTrue();
});
