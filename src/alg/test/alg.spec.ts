import {
  BareBlockMove,
  BlockMove,
  Commutator,
  Group,
  LayerBlockMove,
  Pause,
  RangeBlockMove,
  Sequence,
  Unit,
} from "../algorithm";
import { matchesAlgType } from "../algorithm/alg-part";
import {
  setAlgPartTypeMismatchReportingLevel,
} from "../debug";
import { Example as Ex } from "../example";
import { fromJSON } from "../json";
import {
  parse,
  parseSiGN,
} from "../parser";
import {
  algPartToStringForTesting,
  algToString,
  coalesceBaseMoves,
  expand,
  invert,
  structureEquals,
} from "../traversal";
import {
  validateFlatAlg,
  validateSiGNAlg,
  validateSiGNMoves,
  ValidationError,
} from "../validation";
import "./structure-equals";

setAlgPartTypeMismatchReportingLevel("error");

const UU = new Sequence([BareBlockMove("U", 1), BareBlockMove("U", 1)]);
const U2 = new Sequence([BareBlockMove("U", 2)]);

function e(a1: Sequence, a2: Sequence): jest.Matchers<void, boolean> {
  return expect(structureEquals(a1, a2));
}

describe("AlgPart", () => {
  class PauseSubClass extends Pause {
    public type: string = "fakePause";
  }

  it("cannot subclass directly", () => {
    expect(() => new PauseSubClass()).toThrowError();
  });
});

describe("Sequence", () => {
  it("allows an empty sequence", () => {
    expect(() => new Sequence([])).not.toThrow();
    expect(() => new Commutator(new Sequence([]), new Sequence([]))).not.toThrow();
  });

  it("throws an error for a nested sequence", () => {
    expect(() => new Sequence([new Sequence([BareBlockMove("R", 1)])])).toThrowError(/Expected unit, saw "sequence"/);
  });
});

describe("BlockMove", () => {
  it("allows constructing: x, U, u", () => {
    expect(algPartToStringForTesting(BareBlockMove("x", 1))).toBe("x");
    expect(algPartToStringForTesting(BareBlockMove("U", 1))).toBe("U");
    expect(algPartToStringForTesting(BareBlockMove("u", 1))).toBe("u");
  });

  it("allows constructing: 2U, 2u", () => {
    expect(algPartToStringForTesting(LayerBlockMove(2, "U", 1))).toBe("2U");
    expect(algPartToStringForTesting(LayerBlockMove(2, "u", 1))).toBe("2u");
  });

  it("prevents constructing: 2x, [-2]U, [-2]u", () => {
    expect(() => validateSiGNMoves(new Sequence([LayerBlockMove(2, "x", 1)]))).toThrowError(/cannot have an inner slice/);
    expect(() => validateSiGNMoves(new Sequence([LayerBlockMove(-2, "U", 1)]))).toThrowError(/Cannot have an inner layer of 0 or less/);
    expect(() => validateSiGNMoves(new Sequence([LayerBlockMove(-2, "u", 1)]))).toThrowError(/Cannot have an inner layer of 0 or less/);
  });

  it("allows constructing: 2-3u", () => {
    expect(algPartToStringForTesting(RangeBlockMove(2, 3, "u", 1))).toBe("2-3u");
  });

  it("prevents constructing: 2-3x, 2-3U, [-2]-3u, 4-3u", () => {
    expect(() => validateSiGNMoves(new Sequence([RangeBlockMove(2, 3, "x", 1)]))).toThrowError(/cannot have an outer and inner layer/);
    expect(() => validateSiGNMoves(new Sequence([RangeBlockMove(2, 3, "U", 1)]))).toThrowError(/cannot have an outer and inner layer/);
    expect(() => validateSiGNMoves(new Sequence([RangeBlockMove(-2, 3, "u", 1)]))).toThrowError(/Cannot have an outer layer of 0 or less/);
    expect(() => validateSiGNMoves(new Sequence([RangeBlockMove(4, 3, "u", 1)]))).toThrowError(/The outer layer must be less than the inner layer/);
  });

  it("prevents constructing: w, 2T, 2-3q", () => {
    // expect(() =>algPartToStringForTesting(BareBlockMove("w", 1))).toThrowError(/Invalid SiGN plain move family: w/);
    // expect(() =>algPartToStringForTesting(LayerBlockMove(2, "T", 1))).toThrowError(/The provided SiGN move family is invalid, or cannot have an inner slice: T/);
    // expect(() =>algPartToStringForTesting(RangeBlockMove(2, 3, "q", 1))).toThrowError(/The provided SiGN move family is invalid, or cannot have an outer and inner layer: q/);
  });

  it("supports a default amount of 1.", () => {
    expect(new Sequence([BareBlockMove("U")])).toStructureEqual(new Sequence([BareBlockMove("U", 1)]));
  });

  it("throws an error for an invalid family", () => {
    // expect(() => BareBlockMove("Q", 1)).toThrowError(/Invalid SiGN plain move family/);
  });

  it("has a default amount of 1", () => {
    expect(BareBlockMove("x").amount).toBe(1);
    expect(BareBlockMove("R").amount).toBe(1);
    expect(BareBlockMove("u").amount).toBe(1);
    expect(LayerBlockMove(2, "R").amount).toBe(1);
    expect(LayerBlockMove(3, "u").amount).toBe(1);
    expect(RangeBlockMove(2, 3, "u").amount).toBe(1);
  });

  it("allows different amounts 1", () => {
    expect(BareBlockMove("x", 2).amount).toBe(2);
    expect(BareBlockMove("R", 3).amount).toBe(3);
    expect(BareBlockMove("u", -5).amount).toBe(-5);
    expect(LayerBlockMove(2, "R", 10).amount).toBe(10);
    expect(LayerBlockMove(3, "L", -13).amount).toBe(-13);
    expect(RangeBlockMove(2, 12, "u", 15).amount).toBe(15);
  });

  it("catches invalid moves with parseSiGN().", () => {
    expect(() => parseSiGN("R")).not.toThrowError();
    expect(() => parseSiGN("g")).toThrowError(/Invalid SiGN plain move family/);
    expect(() => parseSiGN("2Ww")).toThrowError(/The provided SiGN move family is invalid/);
    expect(() => parseSiGN("2-3T")).toThrowError(/The provided SiGN move family is invalid/);
    expect(() => parseSiGN("2-3UF")).toThrowError(/The provided SiGN move family is invalid/);
    expect(() => parseSiGN("4TEST_Hello")).toThrowError(/The provided SiGN move family is invalid/);
    expect(() => parseSiGN("_R")).toThrowError(/Invalid SiGN plain move family/);
  });

  it("prevents cosntructing a move with only outer layer", () => {
    expect(() => new BlockMove(4, undefined, "R")).toThrow();
  });
});

describe("algToString()", () => {
  it("converts all move types correctly", () => {
    expect(algPartToStringForTesting(BareBlockMove("x", 2))).toBe("x2");
    expect(algPartToStringForTesting(BareBlockMove("R", 3))).toBe("R3");
    expect(algPartToStringForTesting(BareBlockMove("u", -5))).toBe("u5'");
    expect(algPartToStringForTesting(LayerBlockMove(2, "R", 10))).toBe("2R10");
    expect(algPartToStringForTesting(LayerBlockMove(3, "L", -13))).toBe("3L13'");
    expect(algPartToStringForTesting(RangeBlockMove(2, 12, "u", 15))).toBe("2-12u15");
  });

  it("distinguishes between 1R and R", () => {
    expect(algPartToStringForTesting(LayerBlockMove(1, "R"))).toBe("1R");
    expect(algPartToStringForTesting(BareBlockMove("R"))).toBe("R");
  });

  it("handles empty sequences", () => {
    expect(algToString(new Sequence([]))).toBe("");
    expect(algPartToStringForTesting(new Group(new Sequence([])))).toBe("()");
    // TODO: Should this be "[,]"
    expect(algToString(
      new Sequence([
        new Commutator(
          new Sequence([]),
          new Sequence([]),
        ),
      ]),
    )).toBe("[, ]");
  });

  it("converts Sune to string", () => {
    expect(algToString(Ex.Sune)).toBe("R U R' U R U2' R'");
  });

  it("converts U U to string", () => {
    expect(algToString(UU)).toBe("U U");
  });

  it("converts E-Perm to string", () => {
    expect(algToString(Ex.EPerm)).toBe("x' [[R: U'], D] [[R: U], D] x");
  });

  it("converts triple pause to ... (without spaces)", () => {
    expect(algToString(Ex.TriplePause)).toBe("...");
  });
});

describe("Traversal", () => {
  class FakePause extends Unit {
    public type: string = "pause";
  }

  it("allows subclasses with matching types", () => {
    // expect(() => algPartToStringForTesting(new FakePause())).toThrowError(/Alg part is not an object of type Pause despite having "type": "pause"/);
    expect(algPartToStringForTesting(new FakePause())).toBe(".");
  });
});

describe("invert()", () => {
  it("correctly inverts", () => {
    expect(invert(Ex.Sune)).toStructureEqual(Ex.AntiSune);
    expect(invert(invert(Ex.Sune))).toStructureEqual(Ex.Sune);
    e(invert(invert(Ex.Sune)), Ex.AntiSune).toBe(false);
  });
});

describe("expand()", () => {
  it("correctly expands", () => {
    expect(expand(Ex.FURURFCompact)).toStructureEqual(Ex.FURURFMoves);
    expect(expand(Ex.Sune)).toStructureEqual(Ex.Sune);
    e(expand(Ex.SuneCommutator), Ex.Sune).toBe(false);
    e(expand(Ex.FURURFCompact), expand(Ex.SuneCommutator)).toBe(false);
  });

  it("correctly expands a group with two units", () => {
    expect(expand(parse("(R U)2"))).toStructureEqual(parse("R U R U"));
  });

  it("correctly expands an E-Perm", () => {
    expect(expand(Ex.EPerm)).toStructureEqual(parse("x' R U' R' D R U R' D' R U R' D R U' R' D' x"));
  });
});

describe("structureEquals", () => {
  it("correctly compares algs", () => {
    e(Ex.FURURFCompact, Ex.FURURFMoves).toBe(false);
    e(Ex.FURURFMoves, Ex.FURURFCompact).toBe(false);
    expect(Ex.FURURFMoves).toStructureEqual(Ex.FURURFMoves);
    expect(Ex.FURURFCompact).toStructureEqual(Ex.FURURFCompact);
  });
});

describe("coalesceBaseMoves()", () => {
  it("coalesces U U to U2", () => {
    expect(coalesceBaseMoves(UU)).toStructureEqual(U2);
    expect(algToString(coalesceBaseMoves(UU))).toBe("U2");
  });

  it("coalesces expanded commutator Sune corectly", () => {
    expect(coalesceBaseMoves(expand(Ex.SuneCommutator))).toStructureEqual(Ex.Sune);
  });
});

describe("JSON", () => {
  it("round-trips an alg through JSON stringification", () => {
    e(fromJSON(JSON.parse(JSON.stringify(Ex.FURURFCompact))),
      Ex.FURURFCompact).toBe(true);
  });
});

describe("Object Freezing", () => {
  it("freezes all example alg types", () => {
    // Update this based on the length of AllAlgParts.
    expect(Ex.AllAlgParts.length).toBe(8);
    for (const a of Ex.AllAlgParts) {
      expect(Object.isFrozen(a)).toBe(true);
    }
  });

  it("freezes `nestedUnits` list on Sequence", () => {
    // Update this based on the length of AllAlgParts.
    expect(Object.isFrozen(new Sequence([BareBlockMove("R", 1)]).nestedUnits)).toBe(true);
  });

  it("makes it impossible to modify a BaseMove", () => {
    const b = BareBlockMove("R", 4);
    let caughtErr: Error | undefined;
    try {
      b.amount = 2;
    } catch (err) {
      caughtErr = err;
    }
    expect(caughtErr instanceof TypeError).toBe(true);
  });
});

describe("Parser", () => {
  it("parses an empty sequence", () => {
    expect(parse("")).toStructureEqual(new Sequence([]));
    expect(parse("()")).toStructureEqual(new Sequence([new Group(new Sequence([]))]));
  });

  it("parses a Sune", () => {
    expect(parse("R U R' U R U2' R'")).toStructureEqual(Ex.Sune);
  });

  it("parses U u Uw x 2U 2u 2Uw 2-3u 2-3Uw", () => {
    const s = "U u Uw x 2U 2u 2Uw 2-3u 2-3Uw";
    expect(algToString(parse(s))).toBe(s);
  });

  it("parses ...", () => {
    const p = new Pause();
    expect(parse("...")).toStructureEqual(new Sequence([p, p, p]));
  });

  // TODO: Should these be parsed differently?
  it("parses R and R1 as the same (for now)", () => {
    expect(parse("R")).toStructureEqual(parse("R1"));
  });

  it("round-trips algs through a string", () => {
    expect(parse(algToString(Ex.SuneCommutator))).toStructureEqual(Ex.SuneCommutator);
    expect(parse(algToString(Ex.Niklas))).toStructureEqual(Ex.Niklas);
    expect(parse(algToString(Ex.FURURFCompact))).toStructureEqual(Ex.FURURFCompact);
    expect(parse(algToString(Ex.APermCompact))).toStructureEqual(Ex.APermCompact);
    expect(parse(algToString(Ex.TPerm))).toStructureEqual(Ex.TPerm);
    expect(parse(algToString(Ex.HeadlightSwaps))).toStructureEqual(Ex.HeadlightSwaps);
    expect(parse(algToString(Ex.TriplePause))).toStructureEqual(Ex.TriplePause);
  });

  it("round-trips all alg types through a string", () => {
    // Update this based on the length of AllAlgParts.
    for (const a of Ex.AllAlgParts) {
      const seq = (matchesAlgType(a, "sequence")) ? (a as Sequence) : new Sequence([a]);
      expect(parse(algToString(seq))).toStructureEqual(seq);
    }
  });
});

describe("Validator", () => {
  it("can validate flat algs", () => {
    expect(() => parse("(R)", { validators: [validateFlatAlg] })).toThrowError(/cannot contain a group/); // toThrowError(ValidationError, /cannot contain a group/);
    expect(() => parse("Qw", { validators: [validateFlatAlg] })).not.toThrow(); // not.toThrowError();
    expect(() => parse("(Qw)", { validators: [validateFlatAlg] })).toThrowError(/cannot contain a group/); // toThrowError(ValidationError, );
  });
  it("can validate cube base moves alg", () => {
    expect(() => parse("(R)", { validators: [validateSiGNMoves] })).not.toThrowError();
    expect(() => parse("Qw", { validators: [validateSiGNMoves] })).toThrowError(/Invalid SiGN plain move family/);
    expect(() => parse("(Qw)", { validators: [validateSiGNMoves] })).toThrowError(/Invalid SiGN plain move family/);
  });
  it("can validate cube algs", () => {
    expect(() => parse("(R)", { validators: [validateSiGNAlg] })).toThrowError(/cannot contain a group/);
    expect(() => parse("Qw", { validators: [validateSiGNAlg] })).toThrowError(/Invalid SiGN plain move family/);
    expect(() => parse("(Qw)", { validators: [validateSiGNAlg] })).toThrowError(ValidationError);
  });
  it("throws ValidationError", () => {
    expect(() => parse("(R)", { validators: [validateFlatAlg] })).toThrowError(ValidationError);
  });
});
