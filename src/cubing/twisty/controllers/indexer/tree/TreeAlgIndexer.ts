import type { Alg, Move } from "../../../../alg";
import type { KPuzzle, KTransformation } from "../../../../kpuzzle";
import type { KPattern } from "../../../../kpuzzle/KPattern";
import type {
  MillisecondDuration,
  MillisecondTimestamp,
} from "../../AnimationTypes";
import type { AlgIndexer, LeafCount, LeafIndex } from "../AlgIndexer";
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

  public getAnimLeaf(index: LeafIndex): Move | null {
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

  public indexToMoveStartTimestamp(index: LeafIndex): MillisecondTimestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur as number as MillisecondTimestamp; // TODO
    }
    throw new Error(`Out of algorithm: index ${index}`);
  }

  public indexToMovesInProgress(index: LeafIndex): MillisecondTimestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur as number as MillisecondTimestamp; // TODO
    }
    throw new Error(`Out of algorithm: index ${index}`);
  }

  public patternAtIndex(index: LeafIndex, startPattern?: KPattern): KPattern {
    this.walker.moveByIndex(index);
    return (startPattern ?? this.kpuzzle.defaultPattern()).applyTransformation(
      this.walker.st,
    );
  }

  // TransformAtIndex does not reflect the start pattern; it only reflects
  // the change from the start pattern to the current move index.  If you
  // want the actual pattern, use patternAtIndex.
  public transformationAtIndex(index: LeafIndex): KTransformation {
    this.walker.moveByIndex(index);
    return this.walker.st;
  }

  public numAnimatedLeaves(): LeafCount {
    return this.decoration.moveCount as number as LeafCount; // TODO: This should not need any casting?
  }

  public timestampToIndex(timestamp: MillisecondTimestamp): LeafIndex {
    this.walker.moveByDuration(timestamp as number as MillisecondDuration); // TODO
    return this.walker.i;
  }

  public algDuration(): MillisecondDuration {
    return this.decoration.duration;
  }

  public moveDuration(index: LeafIndex): MillisecondDuration {
    this.walker.moveByIndex(index);
    return this.walker.moveDuration;
  }
}
