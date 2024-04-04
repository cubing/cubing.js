import { expect, test } from "bun:test";

import { Alg } from "./Alg";
import { Commutator, Grouping, Move, Pause, QuantumMove } from "./alg-nodes";
import { setAlgPartTypeMismatchReportingLevel } from "./debug";
import { Example as Ex } from "./example";

setAlgPartTypeMismatchReportingLevel("error");

const UU = new Alg([new Move("U", 1), new Move("U", 1)]);
const U2 = new Alg([new Move("U", 2)]);

test("Alg can be constructed from a string", () => {
  expect(new Alg("R U R'").toString()).toStrictEqual("R U R'");
});

test("Alg can concat algs", () => {
  expect(
    new Alg("R U2").concat(new Alg("F' D")).isIdentical(new Alg("R U2 F' D")),
  ).toBeTrue();
  expect(
    Array.from(new Alg("R U2").concat(new Alg("U R'")).childAlgNodes()).length,
  ).toStrictEqual(4);
  expect(
    new Alg("R U2").concat(new Alg("U R'")).isIdentical(new Alg("R U2 U R'")),
  ).toBeTrue();
});

test("Alg allows an empty Alg", () => {
  expect(() => new Alg()).not.toThrow();
  expect(() => new Alg([])).not.toThrow();
  expect(() => new Commutator(new Alg(), new Alg([]))).not.toThrow();
});

test("Alg throws an error for a nested Alg", () => {
  expect(() => new Alg([new Alg([new Move("R", 1)])])).toThrow(
    /An alg can only contain alg nodes./,
  );
});

test("Move allows constructing: x, U, u", () => {
  expect(new Move("x", 1).toString()).toStrictEqual("x");
  expect(new Move("U", 1).toString()).toStrictEqual("U");
  expect(new Move("u", 1).toString()).toStrictEqual("u");
});

test("Move allows constructing: 2U, 2u", () => {
  expect(new Move(new QuantumMove("U", 2), 1).toString()).toStrictEqual("2U");
  expect(new Move("2U", 1).toString()).toStrictEqual("2U");
  expect(new Move(new QuantumMove("u", 2), 1).toString()).toStrictEqual("2u");
  expect(new Move("2u", 1).toString()).toStrictEqual("2u");
});

test("Move prevents constructing: [-2]U, [-2]u", () => {
  expect(() => new QuantumMove("U", -2)).toThrow(
    /QuantumMove inner layer must be a positive integer/,
  );
});

test("Move allows constructing: 2-3u", () => {
  expect(new Move(new QuantumMove("u", 3, 2), 1).toString()).toStrictEqual(
    "2-3u",
  );
});

test("Move prevents constructing: 2-3x, 2-3U, [-2]-3u, 4-3u", () => {
  // expect(() =>
  //   validateSiGNMoves(new Alg([new Move(new QuantumMove("x",  3, 2, 1)])),
  // ).toThrowError(/cannot have an outer and inner layer/);
  // expect(() =>
  //   validateSiGNMoves(new Alg([new Move(new QuantumMove("U",  3, 2, 1)])),
  // ).toThrowError(/cannot have an outer and inner layer/);
  // expect(() =>
  //   validateSiGNMoves(new Alg([new Move(new QuantumMove("u", 3, -2), 1)])),
  // ).toThrowError(/Cannot have an outer layer of 0 or less/);
  // expect(() =>
  //   validateSiGNMoves(new Alg([new Move(new QuantumMove("u", 3, 4), 1)])),
  // ).toThrowError(/The outer layer must be less than the inner layer/);
});

test("Move prevents constructing: w, 2T, 2-3q", () => {
  // expect(() =>algPartToStringForTesting(new Move("w", 1))).toThrowError(/Invalid SiGN plain move family: w/);
  // expect(() =>algPartToStringForTesting(new Move(new QuantumMove("T", 2), 1))).toThrowError(/The provided SiGN move family is invalid, or cannot have an inner slice: T/);
  // expect(() =>algPartToStringForTesting(new Move(new QuantumMove("q",  3, 2, 1))).toThrowError(/The provided SiGN move family is invalid, or cannot have an outer and inner layer: q/);
});

test("Move supports a default amount of 1.", () => {
  expect(
    new Alg([new Move("U")]).isIdentical(new Alg([new Move("U", 1)])),
  ).toBeTrue();
});

test("Move throws an error for an invalid family", () => {
  // expect(() => new Move("Q", 1)).toThrowError(/Invalid SiGN plain move family/);
});

test("Move has a default amount of 1", () => {
  expect(new Move("x").amount).toStrictEqual(1);
  expect(new Move("R").amount).toStrictEqual(1);
  expect(new Move("u").amount).toStrictEqual(1);
  expect(new Move(new QuantumMove("R", 2)).amount).toStrictEqual(1);
  expect(new Move(new QuantumMove("u", 3)).amount).toStrictEqual(1);
  expect(new Move(new QuantumMove("u", 3, 2)).amount).toStrictEqual(1);
});

test("Move allows different amounts 1", () => {
  expect(new Move("x", 2).amount).toStrictEqual(2);
  expect(new Move("R", 3).amount).toStrictEqual(3);
  expect(new Move("u", -5).amount).toStrictEqual(-5);
  expect(new Move(new QuantumMove("R", 2), 10).amount).toStrictEqual(10);
  expect(new Move(new QuantumMove("L", 3), -13).amount).toStrictEqual(-13);
  expect(new Move(new QuantumMove("u", 12, 2), 15).amount).toStrictEqual(15);
});

test("Move catches invalid moves with parseSiGN().", () => {
  // expect(() => parseSiGN("R")).not.toThrowError();
  // expect(() => parseSiGN("g")).toThrowError(/Invalid SiGN plain move family/);
  // expect(() => parseSiGN("2Ww")).toThrowError(
  //   /The provided SiGN move family is invalid/,
  // );
  // expect(() => parseSiGN("2-3T")).toThrowError(
  //   /The provided SiGN move family is invalid/,
  // );
  // expect(() => parseSiGN("2-3UF")).toThrowError(
  //   /The provided SiGN move family is invalid/,
  // );
  // expect(() => parseSiGN("4TEST_Hello")).toThrowError(
  //   /The provided SiGN move family is invalid/,
  // );
  // expect(() => parseSiGN("_R")).toThrowError(
  //   /Invalid SiGN plain move family/,
  // );
});

test("Move prevents construction a move quantum with only outer layer", () => {
  expect(() => new QuantumMove("R", undefined, 1)).toThrow();
});

test("converts all move types correctly", () => {
  expect(new Move("x", 2).toString()).toStrictEqual("x2");
  expect(new Move("R", 3).toString()).toStrictEqual("R3");
  expect(new Move("u", -5).toString()).toStrictEqual("u5'");
  expect(new Move(new QuantumMove("R", 2), 10).toString()).toStrictEqual(
    "2R10",
  );
  expect(new Move(new QuantumMove("L", 3), -13).toString()).toStrictEqual(
    "3L13'",
  );
  expect(new Move(new QuantumMove("u", 12, 2), 15).toString()).toStrictEqual(
    "2-12u15",
  );
});

test("distinguishes between 1R and R", () => {
  expect(new Move(new QuantumMove("R", 1)).toString()).toStrictEqual("1R");
  expect(new Move("R").toString()).toStrictEqual("R");
});

test("handles empty Algs", () => {
  expect(new Alg().toString()).toStrictEqual("");
  expect(new Alg([]).toString()).toStrictEqual("");
  expect(new Grouping(new Alg([])).toString()).toStrictEqual("()");
  // TODO: Should this be "[,]"
  expect(
    new Alg([new Commutator(new Alg([]), new Alg([]))]).toString(),
  ).toStrictEqual("[, ]");
});

test("converts Sune to string", () => {
  expect(Ex.Sune.toString()).toStrictEqual("R U R' U R U2' R'");
});

test("converts U U to string", () => {
  expect(UU.toString()).toStrictEqual("U U");
});

test("converts E-Perm to string", () => {
  expect(Ex.EPerm.toString()).toStrictEqual("x' [[R: U'], D] [[R: U], D] x");
});

test("converts triple pause to . . . (with spaces)", () => {
  expect(Ex.TriplePause.toString()).toStrictEqual(". . .");
});

test("correctly inverts", () => {
  expect(Ex.Sune.invert().isIdentical(Ex.AntiSune)).toBeTrue();
  expect(Ex.Sune.invert().invert().isIdentical(Ex.Sune)).toBeTrue();
  expect(Ex.Sune.invert().invert().isIdentical(Ex.AntiSune)).toBeFalse();
});

test("correctly expands", () => {
  expect(Ex.FURURFCompact.expand().isIdentical(Ex.FURURFMoves)).toBeTrue();
  expect(Ex.Sune.expand().isIdentical(Ex.Sune)).toBeTrue();
  expect(Ex.SuneCommutator.expand().isIdentical(Ex.Sune)).toBeFalse();
});

test("correctly expands a group with two alg nodes", () => {
  expect(new Alg("(R U)2").expand().isIdentical(new Alg("R U R U"))).toBeTrue();
});

test("correctly expands an E-Perm", () => {
  expect(
    Ex.EPerm.expand().isIdentical(
      new Alg("x' R U' R' D R U R' D' R U R' D R U' R' D' x"),
    ),
  ).toBeTrue();
});

test("correctly compares algs", () => {
  expect(Ex.FURURFCompact.isIdentical(Ex.FURURFMoves)).toBeFalse();
  expect(Ex.FURURFMoves.isIdentical(Ex.FURURFCompact)).toBeFalse();
  expect(Ex.FURURFMoves.isIdentical(Ex.FURURFMoves)).toBeTrue();
  expect(Ex.FURURFCompact.isIdentical(Ex.FURURFCompact)).toBeTrue();
});

test("cancels U U to U2", () => {
  expect(UU.experimentalSimplify({ cancel: true }).isIdentical(U2)).toBeTrue();
});

test("cancels expanded commutator Sune corectly", () => {
  expect(
    Ex.SuneCommutator.expand()
      .experimentalSimplify({ cancel: true })
      .isIdentical(Ex.Sune),
  ).toBeTrue();
});

test("parses an empty Alg", () => {
  expect(new Alg("").isIdentical(new Alg())).toBeTrue();
  expect(
    Alg.fromString("()").isIdentical(new Alg([new Grouping(new Alg([]))])),
  ).toBeTrue();
  expect(new Alg("").isIdentical(new Alg())).toBeTrue();
  expect(
    Alg.fromString("()").isIdentical(new Alg([new Grouping(new Alg([]))])),
  ).toBeTrue();
});

test("parses a Sune", () => {
  expect(new Alg("R U R' U R U2' R'").isIdentical(Ex.Sune)).toBeTrue();
  expect(Alg.fromString("R U R' U R U2' R'").isIdentical(Ex.Sune)).toBeTrue();
  expect(
    new Alg("R U R' U R U2' R'").isIdentical(
      Alg.fromString("R U R' U R U2' R'"),
    ),
  ).toBeTrue();
});

test("parses U u Uw x 2U 2u 2Uw 2-3u 2-3Uw", () => {
  const s = "U u Uw x 2U 2u 2Uw 2-3u 2-3Uw";
  expect(new Alg(s).toString()).toStrictEqual(s);
});

test("parses . . .", () => {
  const p = new Pause();
  expect(new Alg(". . .").isIdentical(new Alg([p, p, p]))).toBeTrue();
});

// TODO: Should these be parsed differently?
test("parses R and R1 as the same (for now)", () => {
  expect(new Alg("R").isIdentical(new Alg("R1"))).toBeTrue();
});

test("round-trips algs through a string", () => {
  expect(
    new Alg(Ex.SuneCommutator.toString()).isIdentical(Ex.SuneCommutator),
  ).toBeTrue();
  expect(new Alg(Ex.Niklas.toString()).isIdentical(Ex.Niklas)).toBeTrue();
  expect(
    new Alg(Ex.FURURFCompact.toString()).isIdentical(Ex.FURURFCompact),
  ).toBeTrue();
  expect(
    new Alg(Ex.APermCompact.toString()).isIdentical(Ex.APermCompact),
  ).toBeTrue();
  expect(new Alg(Ex.TPerm.toString()).isIdentical(Ex.TPerm)).toBeTrue();
  expect(
    new Alg(Ex.HeadlightSwaps.toString()).isIdentical(Ex.HeadlightSwaps),
  ).toBeTrue();
  expect(
    new Alg(Ex.TriplePause.toString()).isIdentical(Ex.TriplePause),
  ).toBeTrue();
});

test("rejects suffixes without families", () => {
  expect(() => {
    Alg.fromString("R U 2'");
  }).toThrow("internal parsing error");
  expect(() => {
    Alg.fromString("R U '");
  }).toThrow("Unexpected character: '");
  expect(() => {
    Alg.fromString("R U 2");
  }).toThrow("internal parsing error");
});
