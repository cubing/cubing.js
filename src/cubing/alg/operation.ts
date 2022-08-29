import { Alg } from "./Alg";
import type { Move } from "./alg-nodes/leaves/Move";

export function experimentalAppendMove(
  alg: Alg,
  newMove: Move,
  options?: {
    coalesce?: boolean; // defaults to false
    wideMoves?: boolean; // defaults to false
    sliceMoves?: boolean; // defaults to false
    mod?: number;
  },
): Alg {
  const oldAlgNodes = Array.from(alg.childAlgNodes());
  const lastMove = oldAlgNodes[oldAlgNodes.length - 1] as Move | undefined;
  const preLastMove = oldAlgNodes[oldAlgNodes.length - 2] as Move | undefined;
  if (
    options?.sliceMoves &&
    "xyz".indexOf(newMove.family) !== -1 &&
    lastMove &&
    lastMove.quantum &&
    preLastMove &&
    preLastMove.quantum
  ) {
    const index = "xyz".indexOf(newMove.family);
    const forwardMove = "LDB"[index];
    const inverseMove = "RUF"[index];
    const newAlgNodes = oldAlgNodes.slice(0, oldAlgNodes.length - 2);
    const lastFamily = lastMove.family;
    const preLastFamily = preLastMove.family;
    if (
      (forwardMove === lastFamily && inverseMove === preLastFamily) ||
      (inverseMove === lastFamily && forwardMove === preLastFamily)
    ) {
      if (lastMove.amount === -preLastMove.amount) {
        let checkMove = lastMove;
        if (inverseMove === preLastFamily) {
          checkMove = preLastMove;
        }
        if (checkMove.amount === -newMove.amount) {
          const family = "MES"[index];
          const amount = family === "S" ? newMove.amount : -newMove.amount;
          newAlgNodes.push(newMove.modified({ family, amount }));
          return new Alg(newAlgNodes);
        }
      }
    }
  }
  if (
    options?.wideMoves &&
    "xyz".indexOf(newMove.family) !== -1 &&
    lastMove &&
    lastMove.quantum
  ) {
    const index = "xyz".indexOf(newMove.family);
    const forwardMove = "LDB"[index];
    const inverseMove = "RUF"[index];
    const moveAlignment = newMove.amount * lastMove.amount;
    const checkMove = moveAlignment > 0 ? forwardMove : inverseMove;
    const newAlgNodes = oldAlgNodes.slice(0, oldAlgNodes.length - 1);
    const lastFamily = lastMove.family;
    if (checkMove === lastFamily) {
      if (lastMove.amount === newMove.amount) {
        const family = "ruf"[index];
        newAlgNodes.push(lastMove.modified({ family }));
        return new Alg(newAlgNodes);
      }
      if (lastMove.amount === -newMove.amount) {
        const family = "ldb"[index];
        newAlgNodes.push(lastMove.modified({ family }));
        return new Alg(newAlgNodes);
      }
    }
  }
  if (
    options?.coalesce &&
    lastMove &&
    lastMove.quantum &&
    lastMove.quantum.isIdentical(newMove.quantum)
  ) {
    const newAlgNodes = oldAlgNodes.slice(0, oldAlgNodes.length - 1);
    let newAmount = lastMove.amount + newMove.amount;
    const mod = options?.mod;
    if (mod) {
      newAmount = ((newAmount % mod) + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newAlgNodes.push(lastMove.modified({ amount: newAmount }));
    }
    return new Alg(newAlgNodes);
  }
  return new Alg([...oldAlgNodes, newMove]);
}
