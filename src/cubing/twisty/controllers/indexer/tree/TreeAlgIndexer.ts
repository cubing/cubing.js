import type { Alg, Move } from "../../../../alg";
import type { KPuzzle, KTransformation } from "../../../../kpuzzle";
import type { KState } from "../../../../kpuzzle/KState";
import type { Duration, Timestamp } from "../../AnimationTypes";
import type { AlgIndexer } from "../AlgIndexer";
import {
  AlgWalkerDecoration,
  AlgWalker,
  DecoratorConstructor,
} from "./AlgWalker";
import { chunkAlgs } from "./chunkAlgs";

export class TreeAlgIndexer implements AlgIndexer {
  private decoration: AlgWalkerDecoration;
  private walker: AlgWalker;
  constructor(private kpuzzle: KPuzzle, alg: Alg) {
    const deccon = new DecoratorConstructor(this.kpuzzle);

    const chunkedAlg = chunkAlgs(alg);

    this.decoration = deccon.traverseAlg(chunkedAlg);
    this.walker = new AlgWalker(this.kpuzzle, chunkedAlg, this.decoration);
  }

  public getAnimLeaf(index: number): Move | null {
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
    throw new Error(`Out of algorithm: index ${index}`);
  }

  public indexToMovesInProgress(index: number): Timestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error(`Out of algorithm: index ${index}`);
  }

  public stateAtIndex(index: number, startState?: KState): KState {
    this.walker.moveByIndex(index);
    return (startState ?? this.kpuzzle.startState()).applyTransformation(
      this.walker.st,
    );
  }

  // TransformAtIndex does not reflect the start state; it only reflects
  // the change from the start state to the current move index.  If you
  // want the actual state, use stateAtIndex.
  public transformationAtIndex(index: number): KTransformation {
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
