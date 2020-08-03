import { BlockMove, expand, Sequence, TraversalUp } from "../../../alg";
import { Puzzle, State } from "../../../twisty-old/puzzle";
import { AlgIndexer, Cursor, countAnimatedMoves } from "./AlgIndexer";

export class SimpleAlgIndexer<P extends Puzzle> implements AlgIndexer<P> {
  private moves: Sequence;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<Cursor.Duration> = new Cursor.AlgDuration(
    Cursor.DefaultDurationForAmount,
  );

  constructor(private puzzle: P, alg: Sequence) {
    this.moves = expand(alg);
    // TODO: Avoid assuming all base moves are block moves.
  }

  public getMove(index: number): BlockMove {
    return this.moves.nestedUnits[index] as BlockMove;
  }

  public indexToMoveStartTimestamp(index: number): Cursor.Timestamp {
    const seq = new Sequence(this.moves.nestedUnits.slice(0, index));
    return this.durationFn.traverse(seq);
  }

  public timestampToIndex(timestamp: Cursor.Timestamp): number {
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

  public algDuration(): Cursor.Duration {
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
