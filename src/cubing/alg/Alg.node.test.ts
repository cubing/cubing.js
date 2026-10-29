import assert from "node:assert";
import { test } from "node:test";
import { Alg } from "./Alg.ts";
import {
  Commutator,
  Grouping,
  Move,
  Pause,
  QuantumMove,
} from "./alg-nodes/index.ts";
import { setAlgPartTypeMismatchReportingLevel } from "./debug.ts";
import { Example as Ex } from "./example.ts";

setAlgPartTypeMismatchReportingLevel("error");

const UU = new Alg([new Move("U", 1), new Move("U", 1)]);
const U2 = new Alg([new Move("U", 2)]);

test("Alg can be constructed from a string", () => {
  assert.strictEqual(new Alg("R U R'").toString(), "R U R'");
});

test("Alg can concat algs", () => {
  assert(
    new Alg("R U2").concat(new Alg("F' D")).isIdentical(new Alg("R U2 F' D")),
  );
  assert.strictEqual(
    Array.from(new Alg("R U2").concat(new Alg("U R'")).childAlgNodes()).length,
    4,
  );
  assert(
    new Alg("R U2").concat(new Alg("U R'")).isIdentical(new Alg("R U2 U R'")),
  );
});

test("Alg allows an empty Alg", () => {
  new Alg();
  new Alg([]);
  new Commutator(new Alg(), new Alg([]));
});

test("Alg throws an error for a nested Alg", {
  expectFailure: /An alg can only contain alg nodes./,
}, () => {
  new Alg([new Alg([new Move("R", 1)])]);
});

test("Move allows constructing: x, U, u", () => {
  assert.strictEqual(new Move("x", 1).toString(), "x");
  assert.strictEqual(new Move("U", 1).toString(), "U");
  assert.strictEqual(new Move("u", 1).toString(), "u");
});

test("Move allows constructing: 2U, 2u", () => {
  assert.strictEqual(new Move(new QuantumMove("U", 2), 1).toString(), "2U");
  assert.strictEqual(new Move("2U", 1).toString(), "2U");
  assert.strictEqual(new Move(new QuantumMove("u", 2), 1).toString(), "2u");
  assert.strictEqual(new Move("2u", 1).toString(), "2u");
});

test("Move prevents constructing: [-2]U, [-2]u", {
  expectFailure: /QuantumMove inner layer must be a positive integer/,
}, () => {
  new QuantumMove("U", -2);
});

test("Move allows constructing: 2-3u", () => {
  assert.strictEqual(
    new Move(new QuantumMove("u", 3, 2), 1).toString(),
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
  assert(new Alg([new Move("U")]).isIdentical(new Alg([new Move("U", 1)])));
});

test("Move throws an error for an invalid family", () => {
  // expect(() => new Move("Q", 1)).toThrowError(/Invalid SiGN plain move family/);
});

test("Move has a default amount of 1", () => {
  assert.strictEqual(new Move("x").amount, 1);
  assert.strictEqual(new Move("R").amount, 1);
  assert.strictEqual(new Move("u").amount, 1);
  assert.strictEqual(new Move(new QuantumMove("R", 2)).amount, 1);
  assert.strictEqual(new Move(new QuantumMove("u", 3)).amount, 1);
  assert.strictEqual(new Move(new QuantumMove("u", 3, 2)).amount, 1);
});

test("Move allows different amounts 1", () => {
  assert.strictEqual(new Move("x", 2).amount, 2);
  assert.strictEqual(new Move("R", 3).amount, 3);
  assert.strictEqual(new Move("u", -5).amount, -5);
  assert.strictEqual(new Move(new QuantumMove("R", 2), 10).amount, 10);
  assert.strictEqual(new Move(new QuantumMove("L", 3), -13).amount, -13);
  assert.strictEqual(new Move(new QuantumMove("u", 12, 2), 15).amount, 15);
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

test("Move prevents construction a move quantum with only outer layer", {
  expectFailure: true,
}, () => {
  new QuantumMove("R", undefined, 1);
});

test("converts all move types correctly", () => {
  assert.strictEqual(new Move("x", 2).toString(), "x2");
  assert.strictEqual(new Move("R", 3).toString(), "R3");
  assert.strictEqual(new Move("u", -5).toString(), "u5'");
  assert.strictEqual(new Move(new QuantumMove("R", 2), 10).toString(), "2R10");
  assert.strictEqual(
    new Move(new QuantumMove("L", 3), -13).toString(),
    "3L13'",
  );
  assert.strictEqual(
    new Move(new QuantumMove("u", 12, 2), 15).toString(),
    "2-12u15",
  );
});

test("distinguishes between 1R and R", () => {
  assert(new Move(new QuantumMove("R", 1)).toString(), "1R");
  assert(new Move("R").toString(), "R");
});

test("handles empty Algs", () => {
  assert.strictEqual(new Alg().toString(), "");
  assert.strictEqual(new Alg([]).toString(), "");
  assert.strictEqual(new Grouping(new Alg([])).toString(), "()");
  // TODO: Should this be "[,]"
  assert.strictEqual(
    new Alg([new Commutator(new Alg([]), new Alg([]))]).toString(),
    "[, ]",
  );
});

test("converts Sune to string", () => {
  assert.strictEqual(Ex.Sune.toString(), "R U R' U R U2' R'");
});

test("converts U U to string", () => {
  assert.strictEqual(UU.toString(), "U U");
});

test("converts E-Perm to string", () => {
  assert.strictEqual(Ex.EPerm.toString(), "x' [[R: U'], D] [[R: U], D] x");
});

test("converts triple pause to . . . (with spaces)", () => {
  assert.strictEqual(Ex.TriplePause.toString(), ". . .");
});

test("correctly inverts", () => {
  assert(Ex.Sune.invert().isIdentical(Ex.AntiSune));
  assert(Ex.Sune.invert().invert().isIdentical(Ex.Sune));
  assert(!Ex.Sune.invert().invert().isIdentical(Ex.AntiSune));
});

test("correctly expands", () => {
  assert(Ex.FURURFCompact.expand().isIdentical(Ex.FURURFMoves));
  assert(Ex.Sune.expand().isIdentical(Ex.Sune));
  assert(!Ex.SuneCommutator.expand().isIdentical(Ex.Sune));
});

test("correctly expands a group with two alg nodes", () => {
  assert(new Alg("(R U)2").expand().isIdentical(new Alg("R U R U")));
});

test("correctly expands an E-Perm", () => {
  assert(
    Ex.EPerm.expand().isIdentical(
      new Alg("x' R U' R' D R U R' D' R U R' D R U' R' D' x"),
    ),
  );
});

test("correctly compares algs", () => {
  assert(!Ex.FURURFCompact.isIdentical(Ex.FURURFMoves));
  assert(!Ex.FURURFMoves.isIdentical(Ex.FURURFCompact));
  assert(Ex.FURURFMoves.isIdentical(Ex.FURURFMoves));
  assert(Ex.FURURFCompact.isIdentical(Ex.FURURFCompact));
});

test("cancels U U to U2", () => {
  assert(UU.experimentalSimplify({ cancel: true }).isIdentical(U2));
});

test("cancels expanded commutator Sune corectly", () => {
  assert(
    Ex.SuneCommutator.expand()
      .experimentalSimplify({ cancel: true })
      .isIdentical(Ex.Sune),
  );
});

test("parses an empty Alg", () => {
  assert(new Alg("").isIdentical(new Alg()));
  assert(
    Alg.fromString("()").isIdentical(new Alg([new Grouping(new Alg([]))])),
  );
  assert(new Alg("").isIdentical(new Alg()));
  assert(
    Alg.fromString("()").isIdentical(new Alg([new Grouping(new Alg([]))])),
  );
});

test("parses a Sune", () => {
  assert(new Alg("R U R' U R U2' R'").isIdentical(Ex.Sune));
  assert(Alg.fromString("R U R' U R U2' R'").isIdentical(Ex.Sune));
  assert(
    new Alg("R U R' U R U2' R'").isIdentical(
      Alg.fromString("R U R' U R U2' R'"),
    ),
  );
});

test("parses U u Uw x 2U 2u 2Uw 2-3u 2-3Uw", () => {
  const s = "U u Uw x 2U 2u 2Uw 2-3u 2-3Uw";
  assert.strictEqual(new Alg(s).toString(), s);
});

test("parses . . .", () => {
  const p = new Pause();
  assert(new Alg(". . .").isIdentical(new Alg([p, p, p])));
});

// TODO: Should these be parsed differently?
test("parses R and R1 as the same (for now)", () => {
  assert(new Alg("R").isIdentical(new Alg("R1")));
});

test("round-trips algs through a string", () => {
  assert(new Alg(Ex.SuneCommutator.toString()).isIdentical(Ex.SuneCommutator));
  assert(new Alg(Ex.Niklas.toString()).isIdentical(Ex.Niklas));
  assert(new Alg(Ex.FURURFCompact.toString()).isIdentical(Ex.FURURFCompact));
  assert(new Alg(Ex.APermCompact.toString()).isIdentical(Ex.APermCompact));
  assert(new Alg(Ex.TPerm.toString()).isIdentical(Ex.TPerm));
  assert(new Alg(Ex.HeadlightSwaps.toString()).isIdentical(Ex.HeadlightSwaps));
  assert(new Alg(Ex.TriplePause.toString()).isIdentical(Ex.TriplePause));
});

test("rejects suffixes without families", () => {
  test({ expectFailure: "internal parsing error" }, () => {
    Alg.fromString("R U 2'");
  });
  test({ expectFailure: "Unexpected character: '" }, () => {
    Alg.fromString("R U '");
  });
  test({ expectFailure: "internal parsing error" }, () => {
    Alg.fromString("R U 2");
  });
});
