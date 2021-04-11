// src/cubing/notation/CountMoves.ts
import {
  TraversalUp
} from "cubing/alg";
var CountMoves = class extends TraversalUp {
  constructor(metric) {
    super();
    this.metric = metric;
  }
  traverseAlg(alg) {
    let r = 0;
    for (const unit of alg.units()) {
      r += this.traverseUnit(unit);
    }
    return r;
  }
  traverseGrouping(grouping) {
    const alg = grouping.experimentalAlg;
    return this.traverseAlg(alg) * Math.abs(grouping.experimentalEffectiveAmount);
  }
  traverseMove(move) {
    return this.metric(move);
  }
  traverseCommutator(commutator) {
    return Math.abs(commutator.experimentalEffectiveAmount) * 2 * (this.traverseAlg(commutator.A) + this.traverseAlg(commutator.B));
  }
  traverseConjugate(conjugate) {
    return Math.abs(conjugate.experimentalEffectiveAmount) * (2 * this.traverseAlg(conjugate.A) + this.traverseAlg(conjugate.B));
  }
  traversePause(_pause) {
    return 0;
  }
  traverseNewline(_newLine) {
    return 0;
  }
  traverseLineComment(_comment) {
    return 0;
  }
};
function isCharUppercase(c) {
  return "A" <= c && c <= "Z";
}
function baseMetric(move) {
  const fam = move.family;
  if (isCharUppercase(fam[0]) && fam[fam.length - 1] === "v" || fam === "x" || fam === "y" || fam === "z" || fam === "T") {
    return 0;
  } else {
    return 1;
  }
}
var countMovesInstance = new CountMoves(baseMetric);
var countMoves = countMovesInstance.traverseAlg.bind(countMovesInstance);

// src/cubing/notation/CountAnimatedMoves.ts
import {
  TraversalUp as TraversalUp2
} from "cubing/alg";
var CountAnimatedMoves = class extends TraversalUp2 {
  traverseAlg(alg) {
    let total = 0;
    for (const part of alg.units()) {
      total += this.traverseUnit(part);
    }
    return total;
  }
  traverseGrouping(grouping) {
    return this.traverseAlg(grouping.experimentalAlg) * Math.abs(grouping.experimentalEffectiveAmount);
  }
  traverseMove(_move) {
    return 1;
  }
  traverseCommutator(commutator) {
    return 2 * (this.traverseAlg(commutator.A) + this.traverseAlg(commutator.B));
  }
  traverseConjugate(conjugate) {
    return 2 * this.traverseAlg(conjugate.A) + this.traverseAlg(conjugate.B);
  }
  traversePause(_pause) {
    return 0;
  }
  traverseNewline(_newline) {
    return 0;
  }
  traverseLineComment(_comment) {
    return 0;
  }
};
var countAnimatedMovesInstance = new CountAnimatedMoves();
var countAnimatedMoves = countAnimatedMovesInstance.traverseAlg.bind(countAnimatedMovesInstance);
export {
  countAnimatedMoves,
  countMoves
};
