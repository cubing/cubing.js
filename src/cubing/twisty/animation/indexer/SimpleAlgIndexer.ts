import { Alg, Turn, TraversalUp } from "../../../alg";
import { PuzzleWrapper, State } from "../../3D/puzzles/KPuzzleWrapper";
import { Duration, Timestamp } from "../cursor/CursorTypes";
import { AlgDuration, defaultDurationForAmount } from "./AlgDuration";
import { AlgIndexer, countAnimatedTurns } from "./AlgIndexer";

export class SimpleAlgIndexer<P extends PuzzleWrapper>
  implements AlgIndexer<P> {
  private turns: Alg;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<Duration> = new AlgDuration(
    defaultDurationForAmount,
  );

  constructor(private puzzle: P, alg: Alg) {
    // TODO: Avoid assuming all base turns are block turns.
    this.turns = new Alg(alg.experimentalExpand());
  }

  public getTurn(index: number): Turn {
    return Array.from(this.turns.units())[index] as Turn; // TODO: perf
  }

  public indexToTurnStartTimestamp(index: number): Timestamp {
    const alg = new Alg(Array.from(this.turns.units()).slice(0, index)); // TODO
    return this.durationFn.traverseAlg(alg);
  }

  public timestampToIndex(timestamp: Timestamp): number {
    let cumulativeTime = 0;
    let i;
    for (i = 0; i < this.numTurns(); i++) {
      cumulativeTime += this.durationFn.traverseTurn(this.getTurn(i));
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
    for (const turn of Array.from(this.turns.units()).slice(0, index)) {
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromTurn(turn as Turn),
      );
    }
    return state;
  }

  public algDuration(): Duration {
    return this.durationFn.traverseAlg(this.turns);
  }

  public numTurns(): number {
    // TODO: Cache internally once performance matters.
    return countAnimatedTurns(this.turns);
  }

  public turnDuration(index: number): number {
    return this.durationFn.traverseTurn(this.getTurn(index));
  }
}
