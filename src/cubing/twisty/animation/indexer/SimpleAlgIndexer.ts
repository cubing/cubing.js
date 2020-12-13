import { BlockMove, expand, Sequence, TraversalUp } from "../../../alg";
import { PuzzleWrapper, State } from "../../3D/puzzles/KPuzzleWrapper";
import { AlgIndexer, countAnimatedMoves } from "./AlgIndexer";
import { Duration, Timestamp } from "../cursor/CursorTypes";
import { AlgDuration, defaultDurationForAmount } from "./AlgDuration";

export class SimpleAlgIndexer<P extends PuzzleWrapper>
  implements AlgIndexer<P> {
  private moves: Sequence;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<Duration> = new AlgDuration(
    defaultDurationForAmount,
  );

  constructor(private puzzle: P, alg: Sequence) {
    this.moves = expand(alg);
    // TODO: Avoid assuming all base moves are block moves.
  }

  public getMove(index: number): BlockMove {
    return this.moves.nestedUnits[index] as BlockMove;
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    const seq = new Sequence(this.moves.nestedUnits.slice(0, index));
    return this.durationFn.traverse(seq);
  }

  public timestampToIndex(timestamp: Timestamp): number {
    let cumulativeTime = 0;
    let i;
    for (i = 0; i < this.numMoves(); i++) {
      cumulativeTime += this.durationFn.traverseBlockMove(this.getMove(i));
      if (cumulativeTime >= timestamp) {
        return i;
      }
    }
    return i;
  }

  public stateAtIndex(index: number): State<P> {
    return this.puzzle.combine(
      this.puzzle.startState(),
      this.transformAtIndex(index),
    );
  }

  public transformAtIndex(index: number): State<P> {
    let state = this.puzzle.identity();
    for (const move of this.moves.nestedUnits.slice(0, index)) {
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromMove(move as BlockMove),
      );
    }
    return state;
  }

  public algDuration(): Duration {
    return this.durationFn.traverse(this.moves);
  }

  public numMoves(): number {
    // TODO: Cache internally once performance matters.
    return countAnimatedMoves(this.moves);
  }

  public moveDuration(index: number): number {
    return this.durationFn.traverseBlockMove(this.getMove(index));
  }
}
