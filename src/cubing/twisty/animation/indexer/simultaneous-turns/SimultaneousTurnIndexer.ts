import { Alg, Turn } from "../../../../alg";
import { PuzzleWrapper, State } from "../../../3D/puzzles/KPuzzleWrapper";
import {
  Direction,
  Duration,
  PuzzlePosition,
  Timestamp,
} from "../../cursor/CursorTypes";
import { AlgIndexer } from "../AlgIndexer";
import { TurnWithRange, simulTurns } from "./simul-turns";

const demos: Record<string, TurnWithRange[]> = {
  "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2": [
    { turn: new Turn("y", -1), start: 0, end: 1000 },
    { turn: new Turn("y", -1), start: 1000, end: 2000 },
    { turn: new Turn("U", -1), start: 1000, end: 1600 },
    { turn: new Turn("E", 1), start: 1200, end: 1800 },
    { turn: new Turn("D"), start: 1400, end: 2000 },
    { turn: new Turn("R", 2), start: 2000, end: 3500 },
    { turn: new Turn("r", 2), start: 2000, end: 3500 },
    { turn: new Turn("F", 2), start: 3500, end: 4200 },
    { turn: new Turn("B", 2), start: 3800, end: 4500 },
    { turn: new Turn("U", 1), start: 4500, end: 5500 },
    { turn: new Turn("E", 1), start: 4500, end: 5500 },
    { turn: new Turn("D", -1), start: 4500, end: 5500 },
    { turn: new Turn("R", 2), start: 5500, end: 6500 },
    { turn: new Turn("L", -2), start: 5500, end: 6500 },
    { turn: new Turn("z", 2), start: 5500, end: 6500 },
    { turn: new Turn("S", 2), start: 6500, end: 7500 },
    { turn: new Turn("U"), start: 7500, end: 8000 },
    { turn: new Turn("U"), start: 8000, end: 8500 },
    { turn: new Turn("D"), start: 7750, end: 8250 },
    { turn: new Turn("D"), start: 8250, end: 8750 },
    { turn: new Turn("S", 2), start: 8750, end: 9250 },
    { turn: new Turn("F", -2), start: 8750, end: 10000 },
    { turn: new Turn("B", 2), start: 8750, end: 10000 },
  ],
  "M' R' U' D' M R": [
    { turn: new Turn("M", -1), start: 0, end: 1000 },
    { turn: new Turn("R", -1), start: 0, end: 1000 },
    { turn: new Turn("U", -1), start: 1000, end: 2000 },
    { turn: new Turn("D", -1), start: 1000, end: 2000 },
    { turn: new Turn("M"), start: 2000, end: 3000 },
    { turn: new Turn("R"), start: 2000, end: 3000 },
  ],
  "U' E' r E r2' E r U E": [
    { turn: new Turn("U", -1), start: 0, end: 1000 },
    { turn: new Turn("E", -1), start: 0, end: 1000 },
    { turn: new Turn("r"), start: 1000, end: 2500 },
    { turn: new Turn("E"), start: 2500, end: 3500 },
    { turn: new Turn("r", -2), start: 3500, end: 5000 },
    { turn: new Turn("E"), start: 5000, end: 6000 },
    { turn: new Turn("r"), start: 6000, end: 7000 },
    { turn: new Turn("U"), start: 7000, end: 8000 },
    { turn: new Turn("E"), start: 7000, end: 8000 },
  ],
};

export class SimultaneousTurnIndexer<P extends PuzzleWrapper>
  implements AlgIndexer<P> {
  private turns: TurnWithRange[];
  // TODO: Allow custom `durationFn`.

  constructor(private puzzle: P, alg: Alg) {
    this.turns = demos[alg.toString()] ?? simulTurns(alg);
    // TODO: Avoid assuming all base turns are block turns.
  }

  public getTurn(index: number): Turn {
    return this.turns[Math.min(index, this.turns.length - 1)].turn;
  }

  private getTurnWithRange(index: number): TurnWithRange {
    return this.turns[Math.min(index, this.turns.length - 1)];
  }

  public indexToTurnStartTimestamp(index: number): Timestamp {
    let start = 0;
    if (this.turns.length > 0) {
      start = this.turns[Math.min(index, this.turns.length - 1)].start;
    }
    return start;
  }

  public timestampToIndex(timestamp: Timestamp): number {
    let i = 0;
    for (i = 0; i < this.turns.length; i++) {
      if (this.turns[i].start >= timestamp) {
        return Math.max(0, i - 1);
      }
    }
    return Math.max(0, i - 1);
  }

  public timestampToPosition(
    timestamp: Timestamp,
    startTransformation?: State<P>,
  ): PuzzlePosition {
    const position: PuzzlePosition = {
      state: startTransformation ?? (this.puzzle.identity() as any),
      turnsInProgress: [],
    };
    for (const turnWithRange of this.turns) {
      if (turnWithRange.end <= timestamp) {
        position.state = this.puzzle.combine(
          position.state,
          this.puzzle.stateFromTurn(turnWithRange.turn),
        ) as any;
      } else if (
        turnWithRange.start < timestamp &&
        timestamp < turnWithRange.end
      ) {
        position.turnsInProgress.push({
          turn: turnWithRange.turn,
          direction: Direction.Forwards,
          fraction:
            (timestamp - turnWithRange.start) /
            (turnWithRange.end - turnWithRange.start),
        });
      } else if (timestamp < turnWithRange.start) {
        continue;
      }
    }
    return position;
  }

  public stateAtIndex(index: number, startTransformation?: State<P>): State<P> {
    let state = startTransformation ?? this.puzzle.startState();
    for (let i = 0; i < this.turns.length && i < index; i++) {
      const turnWithRange = this.turns[i];
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromTurn(turnWithRange.turn),
      );
    }
    return state;
  }

  public transformAtIndex(index: number): State<P> {
    let state = this.puzzle.identity();
    for (const turnWithRange of this.turns.slice(0, index)) {
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromTurn(turnWithRange.turn),
      );
    }
    return state;
  }

  public algDuration(): Duration {
    let max = 0;
    for (const turnWithRange of this.turns) {
      max = Math.max(max, turnWithRange.end);
    }
    return max;
  }

  public numTurns(): number {
    // TODO: Cache internally once performance matters.
    return this.turns.length;
  }

  public turnDuration(index: number): number {
    const turn = this.getTurnWithRange(index);
    return turn.end - turn.start;
  }
}
