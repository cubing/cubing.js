import type { Alg, Move } from "../../../../alg";
import type { KPuzzle, KTransformation } from "../../../../kpuzzle";
import type { KPattern } from "../../../../kpuzzle/KPattern";
import type { Duration, Timestamp } from "../../AnimationTypes";
import type { AlgIndexer } from "../AlgIndexer";
import {
  AlgWalker,
  type AlgWalkerDecoration,
  DecoratorConstructor,
} from "./AlgWalker";
import { chunkAlgs } from "./chunkAlgs";

export class TreeAlgIndexer implements AlgIndexer {
  private decoration: AlgWalkerDecoration;
  private walker: AlgWalker;
  constructor(
    private kpuzzle: KPuzzle,
    alg: Alg,
  ) {
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

  public patternAtIndex(index: number, startPattern?: KPattern): KPattern {
    this.walker.moveByIndex(index);
    return (startPattern ?? this.kpuzzle.defaultPattern()).applyTransformation(
      this.walker.st,
    );
  }

  // TransformAtIndex does not reflect the start pattern; it only reflects
  // the change from the start pattern to the current move index.  If you
  // want the actual pattern, use patternAtIndex.
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
