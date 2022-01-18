import { Move } from "../../../../../alg";
import { KTransformation, KPuzzle } from "../../../../../kpuzzle";

export function isEquivalentTranformationIgnoringCENTERS(
  kpuzzle: KPuzzle,
  t1: KTransformation,
  t2: KTransformation,
): boolean {
  for (const orbitName in kpuzzle.definition.orbits) {
    throw new Error("kpuzzle todo");
    // if (
    //   !oldAreOrbitTransformationsEquivalent(def, orbitName, t1, t2, {
    //     ignoreOrientation: orbitName === "CENTERS",
    //   })
    // ) {
    //   return false;
    // }
  }
  return true;
}

export function passesFilter(def: KPuzzle, state: KTransformation): boolean {
  const kpuzzle = new OldKPuzzle(def);
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
