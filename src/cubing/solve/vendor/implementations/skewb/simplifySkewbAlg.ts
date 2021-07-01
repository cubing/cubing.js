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
  Unit,
} from "../../../../alg";

// TODO: Generalize this to all puzzles.
class SimplifySkewbAlg extends TraversalUp<Alg, Unit> {
  constructor() {
    super();
  }

  public traverseAlg(alg: Alg): Alg {
    const units = [];
    for (const unit of alg.units()) {
      if (unit.is(Move) && unit.as(Move)!.amount % 4 === 0) {
        continue;
      }
      units.push(this.traverseUnit(unit));
    }
    return new Alg(units).simplify({
      collapseMoves: true,
      quantumMoveOrder: () => 3,
    }); // TODO: very inefficient
  }

  public traverseGrouping(grouping: Grouping): Grouping {
    return new Grouping(this.traverseAlg(grouping.alg), grouping.amount);
  }

  public traverseMove(move: Move): Unit {
    const newAmount = (((move.amount % 3) + 4) % 3) - 1;
    return move.modified({ amount: newAmount });
  }

  public traverseCommutator(commutator: Commutator): Unit {
    return new Commutator(
      this.traverseAlg(commutator.A),
      this.traverseAlg(commutator.B),
    );
  }

  public traverseConjugate(conjugate: Conjugate): Unit {
    return new Conjugate(
      this.traverseAlg(conjugate.A),
      this.traverseAlg(conjugate.B),
    );
  }

  public traversePause(pause: Pause): Unit {
    return pause;
  }

  public traverseNewline(newLine: Newline): Unit {
    return newLine;
  }

  public traverseLineComment(comment: LineComment): Unit {
    return comment;
  }
}
const simplifySkewbAlgInstance = new SimplifySkewbAlg();
export const simplifySkewbAlg = simplifySkewbAlgInstance.traverseAlg.bind(
  simplifySkewbAlgInstance,
) as (alg: Alg) => Alg;
