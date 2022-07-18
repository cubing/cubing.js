import { Alg } from "./Alg";
import type { Move } from "./alg-nodes/leaves/Move";

export function experimentalAppendMove(
  alg: Alg,
  newMove: Move,
  options?: {
    coalesce?: boolean; // defaults to false
    mod?: number;
  },
): Alg {
  const oldAlgNodes = Array.from(alg.childAlgNodes());
  const oldLastMove = oldAlgNodes[oldAlgNodes.length - 1] as Move | undefined;
  if (
    options?.coalesce &&
    oldLastMove &&
    oldLastMove.quantum &&
    oldLastMove.quantum.isIdentical(newMove.quantum)
  ) {
    const newAlgNodes = oldAlgNodes.slice(0, oldAlgNodes.length - 1);
    let newAmount = oldLastMove.amount + newMove.amount;
    const mod = options?.mod;
    if (mod) {
      newAmount = ((newAmount % mod) + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newAlgNodes.push(oldLastMove.modified({ amount: newAmount }));
    }
    return new Alg(newAlgNodes);
  } else {
    return new Alg([...oldAlgNodes, newMove]);
  }
}
