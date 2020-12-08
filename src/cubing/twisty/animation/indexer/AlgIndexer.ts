import {
  BlockMove,
  Comment,
  Commutator,
  Conjugate,
  Group,
  NewLine,
  Pause,
  Sequence,
  TraversalUp,
} from "../../../alg";
import { PuzzleWrapper, State } from "../../3D/puzzles/KPuzzleWrapper";
import { Duration, PuzzlePosition, Timestamp } from "../cursor/CursorTypes";

// TODO: Include Pause.
class CountAnimatedMoves extends TraversalUp<number> {
  public traverseSequence(sequence: Sequence): number {
    let total = 0;
    for (const part of sequence.nestedUnits) {
      total += this.traverse(part);
    }
    return total;
  }

  public traverseGroup(group: Group): number {
    return this.traverseSequence(group.nestedSequence);
  }

  public traverseBlockMove(_blockMove: BlockMove): number {
    return 1;
  }

  public traverseCommutator(commutator: Commutator): number {
    return (
      2 *
      (this.traverseSequence(commutator.A) +
        this.traverseSequence(commutator.B))
    );
  }

  public traverseConjugate(conjugate: Conjugate): number {
    return (
      2 * this.traverseSequence(conjugate.A) +
      this.traverseSequence(conjugate.B)
    );
  }

  public traversePause(_pause: Pause): number {
    return 0;
  }

  public traverseNewLine(_newLine: NewLine): number {
    return 0;
  }

  public traverseComment(_comment: Comment): number {
    return 0;
  }
}

export interface AlgIndexer<P extends PuzzleWrapper> {
  getMove(index: number): BlockMove;
  indexToMoveStartTimestamp(index: number): Timestamp;
  stateAtIndex(index: number, startTransformation?: State<P>): State<P>;
  transformAtIndex(index: number): State<P>;
  numMoves(): number;
  timestampToIndex(timestamp: Timestamp): number;
  algDuration(): Duration;
  moveDuration(index: number): number;
  timestampToPosition?: (timestamp: Timestamp) => PuzzlePosition;
}

export function invertBlockMove(bm: BlockMove): BlockMove {
  return new BlockMove(bm.outerLayer, bm.innerLayer, bm.family, -bm.amount);
}
const countAnimatedMovesInstance = new CountAnimatedMoves();
export const countAnimatedMoves = countAnimatedMovesInstance.traverse.bind(
  countAnimatedMovesInstance,
);
