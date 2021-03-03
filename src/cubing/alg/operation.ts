import { Alg } from "./Alg";
import { Move } from "./units/leaves/Move";

export function experimentalAppendMove(
  alg: Alg,
  newMove: Move,
  options?: {
    coalesce?: boolean; // defaults to false
    mod?: number;
  },
): Alg {
  const oldUnits = Array.from(alg.units());
  const oldLastMove = oldUnits[oldUnits.length - 1] as Move | undefined;
  if (
    options?.coalesce &&
    oldLastMove &&
    oldLastMove.quantum &&
    oldLastMove.quantum.isIdentical(newMove.quantum)
  ) {
    const newUnits = oldUnits.slice(0, oldUnits.length - 1);
    let newAmount = oldLastMove.effectiveAmount + newMove.effectiveAmount;
    const mod = options?.mod;
    if (mod) {
      newAmount = ((newAmount % mod) + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newUnits.push(oldLastMove.modified({ repetition: newAmount }));
    }
    return new Alg(newUnits);
  } else {
    return new Alg([...oldUnits, newMove]);
  }
}
