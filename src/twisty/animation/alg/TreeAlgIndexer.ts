import { BlockMove, Sequence } from "../../../alg";
import { Puzzle, State } from "../../../twisty-old/puzzle";
import {
  AlgIndexer,
  AlgPartDecoration,
  AlgWalker,
  DecoratorConstructor,
  invertBlockMove,
  Cursor,
} from "./AlgIndexer";

export class TreeAlgIndexer<P extends Puzzle> implements AlgIndexer<P> {
  private decoration: AlgPartDecoration<P>;
  private walker: AlgWalker<P>;
  constructor(private puzzle: P, alg: Sequence) {
    const deccon = new DecoratorConstructor<P>(this.puzzle);
    this.decoration = deccon.traverse(alg);
    this.walker = new AlgWalker<P>(this.puzzle, alg, this.decoration);
  }

  public getMove(index: number): BlockMove {
    // FIXME need to support Pause
    if (this.walker.moveByIndex(index)) {
      if (!this.walker.mv) {
        throw new Error("`this.walker.mv` missing");
      }
      const bm = this.walker.mv as BlockMove;
      // TODO: this type of negation needs to be in alg
      if (this.walker.back) {
        return invertBlockMove(bm);
      }
      return bm;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public indexToMoveStartTimestamp(index: number): Cursor.Timestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public stateAtIndex(index: number): State<P> {
    this.walker.moveByIndex(index);
    return this.puzzle.combine(this.puzzle.startState(), this.walker.st);
  }

  public transformAtIndex(index: number): State<P> {
    this.walker.moveByIndex(index);
    return this.walker.st;
  }

  public numMoves(): number {
    return this.decoration.moveCount;
  }

  public timestampToIndex(timestamp: Cursor.Timestamp): number {
    this.walker.moveByDuration(timestamp);
    return this.walker.i;
  }

  public algDuration(): Cursor.Duration {
    return this.decoration.duration;
  }

  public moveDuration(index: number): number {
    this.walker.moveByIndex(index);
    return this.walker.moveDur;
  }
}
