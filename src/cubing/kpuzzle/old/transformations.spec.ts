import { experimental3x3x3KPuzzle, OldKPuzzleDefinition } from "../";
import type { Transformation } from "./definition_types";
import { areOrbitTransformationsEquivalent } from "./transformations";

// function isEquivalentTranformationIgnoringOrientationForCENTERS(
//   def: OldKPuzzleDefinition,
//   t1: Transformation,
//   t2: Transformation,
// ): boolean {
//   for (const orbitName in def.orbits) {
//     if (
//       !areOrbitTransformationsEquivalent(def, orbitName, t1, t2, {
//         ignoreOrientation: orbitName === "CENTERS",
//       })
//     ) {
//       return false;
//     }
//   }
//   return true;
// }

describe("tranformations", () => {
  it("correctly compares orbits", async () => {
    expect(
      experimental3x3x3KPuzzle
        .algToTransformation("(R' U' R U')5")
        .isIdentityTransformation(),
    ).toBe(false);

    // kpuzzle todo
    // expect(
    //   areOrbitTransformationsEquivalent(
    //     def,
    //     "CENTERS",
    //     kpuzzle1.state,
    //     kpuzzle2.state,
    //     { ignoreOrientation: true },
    //   ),
    // ).toBe(true);
  });

  it("correctly compares transformations", async () => {
    expect(
      experimental3x3x3KPuzzle
        .algToTransformation("(R' U' R U')5")
        .isIdentityTransformation(),
    ).toBe(false);

    // kpuzzle todo
    //   expect(
    //     isEquivalentTranformationIgnoringOrientationForCENTERS(
    //       def,
    //       kpuzzle1.state,
    //       kpuzzle2.state,
    //     ),
    //   ).toBe(true);
  });
});
