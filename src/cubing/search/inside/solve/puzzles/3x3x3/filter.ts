import { Move } from "../../../../../alg";
import type { KPuzzle } from "../../../../../kpuzzle";
import { KPattern } from "../../../../../kpuzzle";

export function isEquivalentTranformationIgnoringCENTERS(
  t1: KPattern,
  t2: KPattern,
): boolean {
  const t1NoCenterOri = new KPattern(t1.kpuzzle, {
    EDGES: t1.patternData["EDGES"],
    CORNERS: t1.patternData["CORNERS"],
    CENTERS: {
      pieces: t1.patternData["CENTERS"].pieces,
      orientation: new Array(6).fill(0),
    },
  }).experimentalToTransformation()!;
  const t2NoCenterOri = new KPattern(t2.kpuzzle, {
    EDGES: t2.patternData["EDGES"],
    CORNERS: t2.patternData["CORNERS"],
    CENTERS: {
      pieces: t2.patternData["CENTERS"].pieces,
      orientation: new Array(6).fill(0),
    },
  }).experimentalToTransformation()!;
  return t1NoCenterOri.isIdentical(t2NoCenterOri);
}

export function passesFilter(kpuzzle: KPuzzle, pattern: KPattern): boolean {
  if (
    isEquivalentTranformationIgnoringCENTERS(kpuzzle.defaultPattern(), pattern)
  ) {
    return false;
  }

  for (const face of "ULFRBD") {
    for (let amount = 1; amount < 4; amount++) {
      const transformation = kpuzzle
        .moveToTransformation(new Move(face, amount))
        .toKPattern();
      if (isEquivalentTranformationIgnoringCENTERS(transformation, pattern)) {
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
