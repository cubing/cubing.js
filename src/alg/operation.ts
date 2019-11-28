import { BlockMove, Sequence } from "./algorithm";

function canCoalesce(m1: BlockMove, m2: BlockMove): boolean {
  return m1.family === m2.family && m1.innerLayer === m2.innerLayer && m1.outerLayer === m2.outerLayer;
}

interface BlockMoveModifications {
  outerLayer?: number;
  innerLayer?: number;
  family?: string;
  amount?: number;
}

export function modifiedBlockMove(original: BlockMove, modifications: BlockMoveModifications): BlockMove {
  // TODO: use the nullish coalescing operator once it becomes available to us.
  return new BlockMove(
    typeof modifications.outerLayer === "undefined" ? original.outerLayer : modifications.outerLayer,
    typeof modifications.innerLayer === "undefined" ? original.innerLayer : modifications.innerLayer,
    typeof modifications.family === "undefined" ? original.family : modifications.family,
    typeof modifications.amount === "undefined" ? original.amount : modifications.amount,
  );
}

export function experimentalAppendBlockMove(s: Sequence, newMove: BlockMove, coalesceLastMove: boolean = false): Sequence {
  const oldNestedUnits = s.nestedUnits;
  const oldLastMove = oldNestedUnits[oldNestedUnits.length - 1] as (BlockMove | null);
  if (coalesceLastMove && oldLastMove && canCoalesce(oldLastMove, newMove)) {
    const newNestedUnits = s.nestedUnits.slice(0, oldNestedUnits.length - 1);
    const newAmount = oldLastMove.amount + newMove.amount;
    if (newAmount !== 0) {
      newNestedUnits.push(modifiedBlockMove(oldLastMove, { amount: newAmount }));
    }
    return new Sequence(newNestedUnits);
  } else {
    return new Sequence([...oldNestedUnits, newMove]);
  }
}

// This purposely takes sequences as individual arguments, instead of a lsit of sequences, because:
//
// 1. This matches Javascript's built-in `Array.concat()` functionality.
// 2. It encourages avoiding lists of sequences (which might lead to coding mistakes).
//
// TODO: Now useful is it to coalesce at alg boundaries (rather than coalescing the whole result)?
// Should that be a separate function, or should we change this to accept coalescing option arg like `experimentalAppendBlockMove()`?
export function experimentalConcatAlgs(...args: Sequence[]): Sequence {
  return new Sequence(Array.prototype.concat.apply([], [...args].map((s) => s.nestedUnits)));
}
