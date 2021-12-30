import { Alg, Move, TraversalUp } from "../../../alg";
import { countAnimatedLeaves } from "../../../notation";
import type {
  PuzzleWrapper,
  State,
} from "../../views/3D/puzzles/KPuzzleWrapper";
import type { Duration, Timestamp } from "../AnimationTypes";
import { AlgDuration, defaultDurationForAmount } from "./AlgDuration";
import type { AlgIndexer } from "./AlgIndexer";

export class SimpleAlgIndexer<P extends PuzzleWrapper>
  implements AlgIndexer<P>
{
  private moves: Alg;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<Duration> = new AlgDuration(
    defaultDurationForAmount,
  );

  constructor(private puzzle: P, alg: Alg) {
    // TODO: Avoid assuming all base moves are block moves.
    this.moves = new Alg(alg.experimentalExpand());
  }

  public getAnimLeaf(index: number): Move {
    return Array.from(this.moves.units())[index] as Move; // TODO: perf
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    const alg = new Alg(Array.from(this.moves.units()).slice(0, index)); // TODO
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

  public stateAtIndex(index: number): State<P> {
    return this.puzzle.combine(
      this.puzzle.startState(),
      this.transformAtIndex(index),
    );
  }

  public transformAtIndex(index: number): State<P> {
    let state = this.puzzle.identity();
    for (const move of Array.from(this.moves.units()).slice(0, index)) {
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromMove(move as Move),
      );
    }
    return state;
  }

  public algDuration(): Duration {
    return this.durationFn.traverseAlg(this.moves);
  }

  public numAnimatedLeaves(): number {
    // TODO: Cache internally once performance matters.
    return countAnimatedLeaves(this.moves);
  }

  public moveDuration(index: number): number {
    return this.durationFn.traverseMove(this.getAnimLeaf(index));
  }
}
