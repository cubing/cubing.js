import { Move } from "../../../../../alg";
import type { KPuzzle } from "../../../../../kpuzzle";
import { KState } from "../../../../../kpuzzle";

export function isEquivalentTranformationIgnoringCENTERS(
  t1: KState,
  t2: KState,
): boolean {
  const t1NoCenterOri = new KState(t1.kpuzzle, {
    EDGES: t1.stateData.EDGES,
    CORNERS: t1.stateData.CORNERS,
    CENTERS: {
      pieces: t1.stateData.CENTERS.pieces,
      orientation: new Array(6).fill(0),
    },
  }).experimentalToTransformation()!;
  const t2NoCenterOri = new KState(t2.kpuzzle, {
    EDGES: t2.stateData.EDGES,
    CORNERS: t2.stateData.CORNERS,
    CENTERS: {
      pieces: t2.stateData.CENTERS.pieces,
      orientation: new Array(6).fill(0),
    },
  }).experimentalToTransformation()!;
  return t1NoCenterOri.isIdentical(t2NoCenterOri);
}

export function passesFilter(kpuzzle: KPuzzle, state: KState): boolean {
  if (isEquivalentTranformationIgnoringCENTERS(kpuzzle.startState(), state)) {
    return false;
  }

  for (const face of "ULFRBD") {
    for (let amount = 1; amount < 4; amount++) {
      const transformation = kpuzzle.moveToTransformation(
        new Move(face, amount),
      ).toKState();
      if (isEquivalentTranformationIgnoringCENTERS(transformation, state)) {
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
