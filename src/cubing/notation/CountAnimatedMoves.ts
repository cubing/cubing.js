import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalUp,
} from "../alg";

// TODO: Include Pause, include amounts
class CountAnimatedMoves extends TraversalUp<number, number> {
  public traverseAlg(alg: Alg): number {
    let total = 0;
    for (const part of alg.units()) {
      total += this.traverseUnit(part);
    }
    return total;
  }

  public traverseGrouping(grouping: Grouping): number {
    return (
      this.traverseAlg(grouping.experimentalAlg) * Math.abs(grouping.amount)
    );
  }

  public traverseMove(_move: Move): number {
    return 1;
  }

  public traverseCommutator(commutator: Commutator): number {
    return (
      2 * (this.traverseAlg(commutator.A) + this.traverseAlg(commutator.B))
    );
  }

  public traverseConjugate(conjugate: Conjugate): number {
    return 2 * this.traverseAlg(conjugate.A) + this.traverseAlg(conjugate.B);
  }

  public traversePause(_pause: Pause): number {
    return 0;
  }

  public traverseNewline(_newline: Newline): number {
    return 0;
  }

  public traverseLineComment(_comment: LineComment): number {
    return 0;
  }
}

const countAnimatedMovesInstance = new CountAnimatedMoves();
export const countAnimatedMoves: (
  alg: Alg,
) => number = countAnimatedMovesInstance.traverseAlg.bind(
  countAnimatedMovesInstance,
);
