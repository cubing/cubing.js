// @ts-ignore
import { Move } from "../../../../../alg";
import {
  // @ts-ignore
  KPuzzle,
  // @ts-ignore
  areOrbitTransformationsEquivalent,
  // @ts-ignore
  KPuzzleDefinition,
  // @ts-ignore
  Transformation,
  // @ts-ignore
} from "../../../../../kpuzzle";

export function isEquivalentTranformationIgnoringCENTERS(
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

export function passesFilter(
  def: KPuzzleDefinition,
  state: Transformation,
): boolean {
  const kpuzzle = new KPuzzle(def);
  if (isEquivalentTranformationIgnoringCENTERS(def, kpuzzle.state, state)) {
    return false;
  }

  for (const face of "ULFRBD") {
    for (let amount = 1; amount < 4; amount++) {
      kpuzzle.reset();
      kpuzzle.applyMove(new Move(face, amount));
      if (isEquivalentTranformationIgnoringCENTERS(def, kpuzzle.state, state)) {
        return false;
      }
    }
  }

  return true;
}

// TODO: implement tests
// {
//   const def = await puzzles["3x3x3"].def();
//   const kpuzzle = new KPuzzle(def);
//   console.log(passesFilter(def, kpuzzle.state));
//   kpuzzle.applyAlg(parse("R"));
//   console.log(passesFilter(def, kpuzzle.state));
//   kpuzzle.applyAlg(parse("D"));
//   console.log(passesFilter(def, kpuzzle.state));
//   kpuzzle.reset();
//   kpuzzle.applyAlg(parse("(R' U' R U')5"));
//   console.log(passesFilter(def, kpuzzle.state));
// }
