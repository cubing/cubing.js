import {
  type Alg,
  type Commutator,
  type Conjugate,
  functionFromTraversal,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalUp,
} from "../alg";
import type { LeafCount } from "../twisty/controllers/indexer/AlgIndexer";

// TODO: Include Pause, include amounts
class CountAnimatedLeaves extends TraversalUp<LeafCount, LeafCount> {
  public traverseAlg(alg: Alg): LeafCount {
    let total = 0 as LeafCount;
    for (const part of alg.childAlgNodes()) {
      /** @ts-expect-error: ts(2322) Rewriting this would required duplicating `total`. */
      total += this.traverseAlgNode(part);
    }
    return total;
  }

  public traverseGrouping(grouping: Grouping): LeafCount {
    return (this.traverseAlg(grouping.alg) *
      Math.abs(grouping.amount)) as LeafCount;
  }

  public traverseMove(_move: Move): LeafCount {
    return 1 as LeafCount;
  }

  public traverseCommutator(commutator: Commutator): LeafCount {
    return (2 *
      (this.traverseAlg(commutator.A) +
        this.traverseAlg(commutator.B))) as LeafCount;
  }

  public traverseConjugate(conjugate: Conjugate): LeafCount {
    return (2 * this.traverseAlg(conjugate.A) +
      this.traverseAlg(conjugate.B)) as LeafCount;
  }

  public traversePause(_pause: Pause): LeafCount {
    return 1 as LeafCount;
  }

  public traverseNewline(_newline: Newline): LeafCount {
    return 0 as LeafCount;
  }

  public traverseLineComment(_comment: LineComment): LeafCount {
    return 0 as LeafCount;
  }
}

export const countAnimatedLeaves = functionFromTraversal(CountAnimatedLeaves);
