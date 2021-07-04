import type { Alg, Move } from "../../../../alg";
import type { PuzzleWrapper, State } from "../../../3D/puzzles/KPuzzleWrapper";
import type { Duration, Timestamp } from "../../cursor/CursorTypes";
import type { AlgIndexer } from "../AlgIndexer";
import { chunkAlgs } from "./chunkAlgs";
import {
  AlgPartDecoration,
  AlgWalker,
  DecoratorConstructor,
} from "./AlgWalker";

export class TreeAlgIndexer implements AlgIndexer<PuzzleWrapper> {
  private decoration: AlgPartDecoration<PuzzleWrapper>;
  private walker: AlgWalker<PuzzleWrapper>;
  constructor(private puzzle: PuzzleWrapper, alg: Alg) {
    const deccon = new DecoratorConstructor<PuzzleWrapper>(this.puzzle);

    const chunkedAlg = chunkAlgs(alg);

    this.decoration = deccon.traverseAlg(chunkedAlg);
    this.walker = new AlgWalker<PuzzleWrapper>(
      this.puzzle,
      chunkedAlg,
      this.decoration,
    );
  }

  public getMove(index: number): Move | null {
    // FIXME need to support Pause
    if (this.walker.moveByIndex(index)) {
      if (!this.walker.move) {
        throw new Error("`this.walker.mv` missing");
      }
      const move = this.walker.move as Move;
      // TODO: this type of negation needs to be in alg
      if (this.walker.back) {
        return move.invert();
      }
      return move;
    }
    return null;
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public indexToMovesInProgress(index: number): Timestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public stateAtIndex(
    index: number,
    startTransformation?: State<PuzzleWrapper>,
  ): State<PuzzleWrapper> {
    this.walker.moveByIndex(index);
    return this.puzzle.combine(
      startTransformation ?? this.puzzle.startState(),
      this.walker.st,
    );
  }

  // TransformAtIndex does not reflect the start state; it only reflects
  // the change from the start state to the current move index.  If you
  // want the actual state, use stateAtIndex.
  public transformAtIndex(index: number): State<PuzzleWrapper> {
    this.walker.moveByIndex(index);
    return this.walker.st;
  }

  public numAnimatedLeaves(): number {
    return this.decoration.moveCount;
  }

  public timestampToIndex(timestamp: Timestamp): number {
    this.walker.moveByDuration(timestamp);
    return this.walker.i;
  }

  public algDuration(): Duration {
    return this.decoration.duration;
  }

  public moveDuration(index: number): number {
    this.walker.moveByIndex(index);
    return this.walker.moveDuration;
  }
}
