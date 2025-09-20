import { Alg, type Move, type TraversalUp } from "../../../alg";
import type { KPuzzle, KTransformation } from "../../../kpuzzle";
import type { KPattern } from "../../../kpuzzle/KPattern";
import { experimentalCountAnimatedLeaves } from "../../../notation";
import type {
  MillisecondDuration,
  MillisecondTimestamp,
} from "../AnimationTypes";
import { AlgDuration, defaultDurationForAmount } from "./AlgDuration";
import type { AlgIndexer, LeafCount, LeafIndex } from "./AlgIndexer";

export class SimpleAlgIndexer implements AlgIndexer {
  private moves: Alg;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<MillisecondDuration> = new AlgDuration(
    defaultDurationForAmount,
  );

  constructor(
    private kpuzzle: KPuzzle,
    alg: Alg,
  ) {
    // TODO: Avoid assuming all base moves are block moves.
    this.moves = new Alg(alg.experimentalExpand());
  }

  public getAnimLeaf(index: number): Move {
    return Array.from(this.moves.childAlgNodes())[index] as Move; // TODO: perf
  }

  public indexToMoveStartTimestamp(index: number): MillisecondTimestamp {
    const alg = new Alg(Array.from(this.moves.childAlgNodes()).slice(0, index)); // TODO
    return this.durationFn.traverseAlg(alg) as number as MillisecondTimestamp;
  }

  public timestampToIndex(timestamp: MillisecondTimestamp): LeafIndex {
    let cumulativeTime = 0;
    let i: number;
    for (i = 0; i < this.numAnimatedLeaves(); i++) {
      cumulativeTime += this.durationFn.traverseMove(this.getAnimLeaf(i));
      if (cumulativeTime >= timestamp) {
        return i as LeafIndex;
      }
    }
    return i as LeafIndex;
  }

  public patternAtIndex(index: number): KPattern {
    return this.kpuzzle
      .defaultPattern()
      .applyTransformation(this.transformationAtIndex(index));
  }

  public transformationAtIndex(index: number): KTransformation {
    let pattern = this.kpuzzle.identityTransformation();
    for (const move of Array.from(this.moves.childAlgNodes()).slice(0, index)) {
      // TODO
      pattern = pattern.applyMove(move as Move);
    }
    return pattern;
  }

  public algDuration(): MillisecondDuration {
    return this.durationFn.traverseAlg(this.moves);
  }

  public numAnimatedLeaves(): LeafCount {
    // TODO: Cache internally once performance matters.
    return experimentalCountAnimatedLeaves(this.moves) as LeafCount;
  }

  public moveDuration(index: LeafIndex): MillisecondDuration {
    return this.durationFn.traverseMove(this.getAnimLeaf(index));
  }
}
