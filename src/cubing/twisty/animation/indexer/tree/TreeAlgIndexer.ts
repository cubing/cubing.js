import { Alg, Turn } from "../../../../alg";
import { PuzzleWrapper, State } from "../../../3D/puzzles/KPuzzleWrapper";
import { Duration, Timestamp } from "../../cursor/CursorTypes";
import { AlgIndexer } from "../AlgIndexer";
import { AlgPartDecoration, AlgWalker, DecoratorConstructor } from "./walker";

export class TreeAlgIndexer implements AlgIndexer<PuzzleWrapper> {
  private decoration: AlgPartDecoration<PuzzleWrapper>;
  private walker: AlgWalker<PuzzleWrapper>;
  constructor(private puzzle: PuzzleWrapper, alg: Alg) {
    const deccon = new DecoratorConstructor<PuzzleWrapper>(this.puzzle);
    this.decoration = deccon.traverseAlg(alg);
    this.walker = new AlgWalker<PuzzleWrapper>(
      this.puzzle,
      alg,
      this.decoration,
    );
  }

  public getTurn(index: number): Turn | null {
    // FIXME need to support Pause
    if (this.walker.turnByIndex(index)) {
      if (!this.walker.turn) {
        throw new Error("`this.walker.mv` missing");
      }
      const turn = this.walker.turn as Turn;
      // TODO: this type of negation needs to be in alg
      if (this.walker.back) {
        return turn.inverse();
      }
      return turn;
    }
    return null;
  }

  public indexToTurnStartTimestamp(index: number): Timestamp {
    if (this.walker.turnByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public indexToTurnsInProgress(index: number): Timestamp {
    if (this.walker.turnByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public stateAtIndex(
    index: number,
    startTransformation?: State<PuzzleWrapper>,
  ): State<PuzzleWrapper> {
    this.walker.turnByIndex(index);
    return this.puzzle.combine(
      startTransformation ?? this.puzzle.startState(),
      this.walker.st,
    );
  }

  // TransformAtIndex does not reflect the start state; it only reflects
  // the change from the start state to the current turn index.  If you
  // want the actual state, use stateAtIndex.
  public transformAtIndex(index: number): State<PuzzleWrapper> {
    this.walker.turnByIndex(index);
    return this.walker.st;
  }

  public numTurns(): number {
    return this.decoration.turnCount;
  }

  public timestampToIndex(timestamp: Timestamp): number {
    this.walker.turnByDuration(timestamp);
    return this.walker.i;
  }

  public algDuration(): Duration {
    return this.decoration.duration;
  }

  public turnDuration(index: number): number {
    this.walker.turnByIndex(index);
    return this.walker.turnDuration;
  }
}
