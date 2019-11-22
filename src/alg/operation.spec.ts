import { BareBlockMove, LayerBlockMove } from "./algorithm";
import { experimentalAppendBlockMove, modifiedBlockMove } from "./operation";
import { parse } from "./parser";
import { algPartToStringForTesting, algToString } from "./traversal";

describe("operation", () => {
  it("can modify BlockMove", () => {
    expect(algPartToStringForTesting(modifiedBlockMove(BareBlockMove("R"), {amount: 2}))).toBe("R2");
    expect(algPartToStringForTesting(modifiedBlockMove(LayerBlockMove(4, "r", 3), {family: "u", outerLayer: 2}))).toBe("2-4u3");
  });

  it("can append moves", () => {
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("U2")))).toBe("R U R' U2");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R", -1)))).toBe("R U R' R'");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R")))).toBe("R U R' R");
  });

  it("can coalesce appended moves", () => {
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("U2"), true))).toBe("R U R' U2");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R", -1), true))).toBe("R U R2'");
    expect(algToString(experimentalAppendBlockMove(parse("R U R'"), BareBlockMove("R"), true))).toBe("R U");
  });
});
