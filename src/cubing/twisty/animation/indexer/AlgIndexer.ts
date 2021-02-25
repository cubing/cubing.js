import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Turn,
  Newline,
  Pause,
  TraversalUp,
} from "../../../alg";
import { PuzzleWrapper, State } from "../../3D/puzzles/KPuzzleWrapper";
import { Duration, PuzzlePosition, Timestamp } from "../cursor/CursorTypes";

export interface AlgIndexer<P extends PuzzleWrapper> {
  getMove(index: number): Turn | null;
  indexToMoveStartTimestamp(index: number): Timestamp;
  stateAtIndex(index: number, startTransformation?: State<P>): State<P>;
  transformAtIndex(index: number): State<P>;
  numMoves(): number;
  timestampToIndex(timestamp: Timestamp): number;
  algDuration(): Duration;
  moveDuration(index: number): number;
  timestampToPosition?: (
    timestamp: Timestamp,
    startTransformation?: State<P>,
  ) => PuzzlePosition;
}

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
      this.traverseAlg(grouping.experimentalAlg) *
      Math.abs(grouping.experimentalEffectiveAmount)
    );
  }

  public traverseMove(_move: Turn): number {
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
export const countAnimatedMoves = countAnimatedMovesInstance.traverseAlg.bind(
  countAnimatedMovesInstance,
);
