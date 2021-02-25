import { KPuzzleDefinition } from ".";
import { Alg } from "../alg";
import { puzzles } from "../puzzles";
import { Transformation } from "./definition_types";
import { KPuzzle } from "./kpuzzle";
import {
  areOrbitTransformationsEquivalent,
  areTransformationsEquivalent,
} from "./transformations";

function isEquivalentTranformationIgnoringOrientationForCENTERS(
  def: KPuzzleDefinition,
  t1: Transformation,
  t2: Transformation,
): boolean {
  for (const orbitName in def.orbits) {
    if (
      !areOrbitTransformationsEquivalent(def, orbitName, t1, t2, {
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
    kpuzzle1.applyAlg(Alg.fromString(""));
    const kpuzzle2 = new KPuzzle(def);
    kpuzzle2.applyAlg(Alg.fromString("(R' U' R U')5"));

    expect(
      areOrbitTransformationsEquivalent(
        def,
        "CENTERS",
        kpuzzle1.state,
        kpuzzle2.state,
      ),
    ).toBe(false);

    expect(
      areOrbitTransformationsEquivalent(
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
    kpuzzle1.applyAlg(Alg.fromString(""));
    const kpuzzle2 = new KPuzzle(def);
    kpuzzle2.applyAlg(Alg.fromString("(R' U' R U')5"));

    expect(
      areTransformationsEquivalent(def, kpuzzle1.state, kpuzzle2.state),
    ).toBe(false);

    expect(
      isEquivalentTranformationIgnoringOrientationForCENTERS(
        def,
        kpuzzle1.state,
        kpuzzle2.state,
      ),
    ).toBe(true);
  });
});
