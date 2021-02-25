import { Alg, Turn, TraversalUp } from "../../../alg";
import { PuzzleWrapper, State } from "../../3D/puzzles/KPuzzleWrapper";
import { Duration, Timestamp } from "../cursor/CursorTypes";
import { AlgDuration, defaultDurationForAmount } from "./AlgDuration";
import { AlgIndexer, countAnimatedMoves } from "./AlgIndexer";

export class SimpleAlgIndexer<P extends PuzzleWrapper>
  implements AlgIndexer<P> {
  private moves: Alg;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<Duration> = new AlgDuration(
    defaultDurationForAmount,
  );

  constructor(private puzzle: P, alg: Alg) {
    // TODO: Avoid assuming all base moves are block moves.
    this.moves = new Alg(alg.experimentalExpand());
  }

  public getMove(index: number): Turn {
    return Array.from(this.moves.units())[index] as Turn; // TODO: perf
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    const alg = new Alg(Array.from(this.moves.units()).slice(0, index)); // TODO
    return this.durationFn.traverseAlg(alg);
  }

  public timestampToIndex(timestamp: Timestamp): number {
    let cumulativeTime = 0;
    let i;
    for (i = 0; i < this.numMoves(); i++) {
      cumulativeTime += this.durationFn.traverseMove(this.getMove(i));
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
        this.puzzle.stateFromMove(move as Turn),
      );
    }
    return state;
  }

  public algDuration(): Duration {
    return this.durationFn.traverseAlg(this.moves);
  }

  public numMoves(): number {
    // TODO: Cache internally once performance matters.
    return countAnimatedMoves(this.moves);
  }

  public moveDuration(index: number): number {
    return this.durationFn.traverseMove(this.getMove(index));
  }
}
