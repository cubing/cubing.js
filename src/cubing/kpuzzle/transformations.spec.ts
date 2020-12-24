import { KPuzzleDefinition } from ".";
import { parseAlg } from "../alg";
import { puzzles } from "../puzzles";
import { Transformation } from "./definition_types";
import { KPuzzle } from "./kpuzzle";
import {
  EquivalentOrbitTransformations,
  EquivalentTransformations,
} from "./transformations";

function isEquivalentTranformationIgnoringOrientationForCENTERS(
  def: KPuzzleDefinition,
  t1: Transformation,
  t2: Transformation,
): boolean {
  for (const orbitName in def.orbits) {
    if (
      !EquivalentOrbitTransformations(def, orbitName, t1, t2, {
        ignoreOrientation: orbitName === "CENTERS",
      })
    ) {
      return false;
    }
  }
  return true;
}

describe("tranformations", () => {
  it("correctly compares orbits", async () => {
    const def = await puzzles["3x3x3"].def();
    const kpuzzle1 = new KPuzzle(def);
    kpuzzle1.applyAlg(parseAlg(""));
    const kpuzzle2 = new KPuzzle(def);
    kpuzzle2.applyAlg(parseAlg("(R' U' R U')5"));

    expect(
      EquivalentOrbitTransformations(
        def,
        "CENTERS",
        kpuzzle1.state,
        kpuzzle2.state,
      ),
    ).toBe(false);

    expect(
      EquivalentOrbitTransformations(
        def,
        "CENTERS",
        kpuzzle1.state,
        kpuzzle2.state,
        { ignoreOrientation: true },
      ),
    ).toBe(true);
  });

  it("correctly compares transformations", async () => {
    const def = await puzzles["3x3x3"].def();
    const kpuzzle1 = new KPuzzle(def);
    kpuzzle1.applyAlg(parseAlg(""));
    const kpuzzle2 = new KPuzzle(def);
    kpuzzle2.applyAlg(parseAlg("(R' U' R U')5"));

    expect(EquivalentTransformations(def, kpuzzle1.state, kpuzzle2.state)).toBe(
      false,
    );

    expect(
      isEquivalentTranformationIgnoringOrientationForCENTERS(
        def,
        kpuzzle1.state,
        kpuzzle2.state,
      ),
    ).toBe(true);
  });
});
