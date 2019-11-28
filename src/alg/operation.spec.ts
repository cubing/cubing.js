import { BareBlockMove, LayerBlockMove } from "./algorithm";
import { experimentalAppendBlockMove, experimentalConcatAlgs, modifiedBlockMove } from "./operation";
import { parse } from "./parser";
import { algPartToStringForTesting, algToString } from "./traversal";

describe("operation", () => {
  it("can modify BlockMove", () => {
    expect(algPartToStringForTesting(modifiedBlockMove(BareBlockMove("R"), { amount: 2 }))).toBe("R2");
    expect(algPartToStringForTesting(modifiedBlockMove(LayerBlockMove(4, "r", 3), { family: "u", outerLayer: 2 }))).toBe("2-4u3");
  });

  it("can append moves", () => {
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("U2")))).toBe("R U R' U2");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R", -2)))).toBe("R U R' R2'");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R")))).toBe("R U R' R");
  });

  it("can coalesce appended moves", () => {
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("U2"), true))).toBe("R U R' U2");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R", -2), true))).toBe("R U R3'");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R"), true))).toBe("R U");
  });

  it("can concat algs", () => {
    expect(algToString(experimentalConcatAlgs(parse("R U2"), parse("F' D")))).toBe("R U2 F' D");
    expect(experimentalConcatAlgs(parse("R U2"), parse("U R'")).nestedUnits.length).toBe(4);
    expect(algToString(experimentalConcatAlgs(parse("R U2"), parse("U R'")))).toBe("R U2 U R'");
  });
});
