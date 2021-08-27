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
} from "../../../alg";
import type { Parsed } from "../../../alg/parse";

export type AnimatedLeafUnit = Move | Pause;
export type OrderedLeafTokens = Parsed<AnimatedLeafUnit>[];

class LeafTokens extends TraversalUp<OrderedLeafTokens> {
  public traverseAlg(alg: Alg): OrderedLeafTokens {
    const unitArrays: OrderedLeafTokens[] = [];
    for (const unit of alg.units()) {
      unitArrays.push(this.traverseUnit(unit));
    }
    return Array.prototype.concat(...unitArrays);
  }

  public traverseGrouping(grouping: Grouping): OrderedLeafTokens {
    return this.traverseAlg(grouping.alg);
  }

  public traverseMove(move: Move): OrderedLeafTokens {
    return [move as Parsed<Move>]; // TODO: What if not parsed?
  }

  public traverseCommutator(commutator: Commutator): OrderedLeafTokens {
    return this.traverseAlg(commutator.A).concat(
      this.traverseAlg(commutator.B),
    );
  }

  public traverseConjugate(conjugate: Conjugate): OrderedLeafTokens {
    return this.traverseAlg(conjugate.A).concat(this.traverseAlg(conjugate.B));
  }

  public traversePause(pause: Pause): OrderedLeafTokens {
    return [pause as Parsed<Pause>]; // TODO: What if not parsed?
  }

  public traverseNewline(_newline: Newline): OrderedLeafTokens {
    return [];
  }

  public traverseLineComment(_comment: LineComment): OrderedLeafTokens {
    return [];
  }
}

const leafTokensInstance = new LeafTokens();
export const leafTokens = leafTokensInstance.traverseAlg.bind(
  leafTokensInstance,
) as (alg: Alg) => OrderedLeafTokens;
