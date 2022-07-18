import { Alg, Move, TraversalUp } from "../../../alg";
import type { KPuzzle, KTransformation } from "../../../kpuzzle";
import type { KState } from "../../../kpuzzle/KState";
import { experimentalCountAnimatedLeaves } from "../../../notation";
import type { Duration, Timestamp } from "../AnimationTypes";
import { AlgDuration, defaultDurationForAmount } from "./AlgDuration";
import type { AlgIndexer } from "./AlgIndexer";

export class SimpleAlgIndexer implements AlgIndexer {
  private moves: Alg;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<Duration> = new AlgDuration(
    defaultDurationForAmount,
  );

  constructor(private kpuzzle: KPuzzle, alg: Alg) {
    // TODO: Avoid assuming all base moves are block moves.
    this.moves = new Alg(alg.experimentalExpand());
  }

  public getAnimLeaf(index: number): Move {
    return Array.from(this.moves.childAlgNodes())[index] as Move; // TODO: perf
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    const alg = new Alg(Array.from(this.moves.childAlgNodes()).slice(0, index)); // TODO
    return this.durationFn.traverseAlg(alg);
  }

  public timestampToIndex(timestamp: Timestamp): number {
    let cumulativeTime = 0;
    let i;
    for (i = 0; i < this.numAnimatedLeaves(); i++) {
      cumulativeTime += this.durationFn.traverseMove(this.getAnimLeaf(i));
      if (cumulativeTime >= timestamp) {
        return i;
      }
    }
    return i;
  }

  public stateAtIndex(index: number): KState {
    return this.kpuzzle
      .startState()
      .applyTransformation(this.transformationAtIndex(index));
  }

  public transformationAtIndex(index: number): KTransformation {
    let state = this.kpuzzle.identityTransformation();
    for (const move of Array.from(this.moves.childAlgNodes()).slice(0, index)) {
      // TODO
      state = state.applyMove(move as Move);
    }
    return state;
  }

  public algDuration(): Duration {
    return this.durationFn.traverseAlg(this.moves);
  }

  public numAnimatedLeaves(): number {
    // TODO: Cache internally once performance matters.
    return experimentalCountAnimatedLeaves(this.moves);
  }

  public moveDuration(index: number): number {
    return this.durationFn.traverseMove(this.getAnimLeaf(index));
  }
}
