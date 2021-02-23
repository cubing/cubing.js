import { Move } from "./Move";
import { algPartToStringForTesting, algToString } from "./traversal";

describe("operation", () => {
  it("can modify BlockMove", () => {
    expect(
      algPartToStringForTesting(new Move("R").modified({ repetition: 2 })),
    ).toBe("R2");
    expect(
      algPartToStringForTesting(
        modifiedBlockMove(LayerBlockMove(4, "r", 3), {
          family: "u",
          outerLayer: 2,
        }),
      ),
    ).toBe("2-4u3");
  });

  it("can append moves", () => {
    expect(
      algToString(
        experimentalAppendBlockMove(parseAlg("R U R'"), BareBlockMove("U2")),
      ),
    ).toBe("R U R' U2");
    expect(
      algToString(
        experimentalAppendBlockMove(parseAlg("R U R'"), BareBlockMove("R", -2)),
      ),
    ).toBe("R U R' R2'");
    expect(
      algToString(
        experimentalAppendBlockMove(parseAlg("R U R'"), BareBlockMove("R")),
      ),
    ).toBe("R U R' R");
  });

  it("can coalesce appended moves", () => {
    expect(
      algToString(
        experimentalAppendBlockMove(
          parseAlg("R U R'"),
          BareBlockMove("U2"),
          true,
        ),
      ),
    ).toBe("R U R' U2");
    expect(
      algToString(
        experimentalAppendBlockMove(
          parseAlg("R U R'"),
          BareBlockMove("R", -2),
          true,
        ),
      ),
    ).toBe("R U R3'");
    expect(
      algToString(
        experimentalAppendBlockMove(
          parseAlg("R U R'"),
          BareBlockMove("R"),
          true,
        ),
      ),
    ).toBe("R U");
  });

  it("can concat algs", () => {
    expect(
      algToString(experimentalConcatAlgs(parseAlg("R U2"), parseAlg("F' D"))),
    ).toBe("R U2 F' D");
    expect(
      experimentalConcatAlgs(parseAlg("R U2"), parseAlg("U R'")).nestedUnits
        .length,
    ).toBe(4);
    expect(
      algToString(experimentalConcatAlgs(parseAlg("R U2"), parseAlg("U R'"))),
    ).toBe("R U2 U R'");
  });
});
