import { Alg } from "./Alg";
import { Turn } from "./units/leaves/Turn";

export function experimentalAppendTurn(
  alg: Alg,
  newTurn: Turn,
  options?: {
    coalesce?: boolean; // defaults to false
    mod?: number;
  },
): Alg {
  const oldUnits = Array.from(alg.units());
  const oldLastTurn = oldUnits[oldUnits.length - 1] as Turn | undefined;
  if (
    options?.coalesce &&
    oldLastTurn &&
    oldLastTurn.quantum.isIdentical(newTurn.quantum)
  ) {
    const newUnits = oldUnits.slice(0, oldUnits.length - 1);
    let newAmount = oldLastTurn.effectiveAmount + newTurn.effectiveAmount;
    const mod = options?.mod;
    if (mod) {
      newAmount = ((newAmount % mod) + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newUnits.push(oldLastTurn.modified({ repetition: newAmount }));
    }
    return new Alg(newUnits);
  } else {
    return new Alg([...oldUnits, newTurn]);
  }
}
