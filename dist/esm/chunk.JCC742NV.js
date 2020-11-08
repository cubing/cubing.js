import {
  modifiedBlockMove
} from "./chunk.SBF4OERV.js";
import {
  Sequence
} from "./chunk.KHJLFQEA.js";

// src/alg/operation.ts
function canCoalesce(m1, m2) {
  return m1.family === m2.family && m1.innerLayer === m2.innerLayer && m1.outerLayer === m2.outerLayer;
}
function experimentalAppendBlockMove(s, newMove, coalesceLastMove = false, mod = 0) {
  const oldNestedUnits = s.nestedUnits;
  const oldLastMove = oldNestedUnits[oldNestedUnits.length - 1];
  if (coalesceLastMove && oldLastMove && canCoalesce(oldLastMove, newMove)) {
    const newNestedUnits = s.nestedUnits.slice(0, oldNestedUnits.length - 1);
    let newAmount = oldLastMove.amount + newMove.amount;
    if (mod > 1) {
      newAmount = (newAmount % mod + mod) % mod;
      if (newAmount * 2 > mod) {
        newAmount -= mod;
      }
    }
    if (newAmount !== 0) {
      newNestedUnits.push(modifiedBlockMove(oldLastMove, {amount: newAmount}));
    }
    return new Sequence(newNestedUnits);
  } else {
    return new Sequence([...oldNestedUnits, newMove]);
  }
}

export {
  experimentalAppendBlockMove
};
//# sourceMappingURL=chunk.7FA3ORVO.js.map
