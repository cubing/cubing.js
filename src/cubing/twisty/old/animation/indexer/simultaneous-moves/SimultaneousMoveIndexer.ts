import { Alg, Move } from "../../../../../alg";
import type { PuzzleWrapper, State } from "../../../../views/3D/puzzles/KPuzzleWrapper";
import {
  Direction,
  Duration,
  PuzzlePosition,
  Timestamp,
} from "../../cursor/CursorTypes";
import type { AlgIndexer, CurrentMove, CurrentMoveInfo } from "../AlgIndexer";
import { MoveWithRange, simulMoves } from "./simul-moves";

const demos: Record<string, MoveWithRange[]> = {
  "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2": [
    { move: new Move("y", -1), start: 0, end: 1000 },
    { move: new Move("y", -1), start: 1000, end: 2000 },
    { move: new Move("U", -1), start: 1000, end: 1600 },
    { move: new Move("E", 1), start: 1200, end: 1800 },
    { move: new Move("D"), start: 1400, end: 2000 },
    { move: new Move("R", 2), start: 2000, end: 3500 },
    { move: new Move("r", 2), start: 2000, end: 3500 },
    { move: new Move("F", 2), start: 3500, end: 4200 },
    { move: new Move("B", 2), start: 3800, end: 4500 },
    { move: new Move("U", 1), start: 4500, end: 5500 },
    { move: new Move("E", 1), start: 4500, end: 5500 },
    { move: new Move("D", -1), start: 4500, end: 5500 },
    { move: new Move("R", 2), start: 5500, end: 6500 },
    { move: new Move("L", -2), start: 5500, end: 6500 },
    { move: new Move("z", 2), start: 5500, end: 6500 },
    { move: new Move("S", 2), start: 6500, end: 7500 },
    { move: new Move("U"), start: 7500, end: 8000 },
    { move: new Move("U"), start: 8000, end: 8500 },
    { move: new Move("D"), start: 7750, end: 8250 },
    { move: new Move("D"), start: 8250, end: 8750 },
    { move: new Move("S", 2), start: 8750, end: 9250 },
    { move: new Move("F", -2), start: 8750, end: 10000 },
    { move: new Move("B", 2), start: 8750, end: 10000 },
  ],
  "M' R' U' D' M R": [
    { move: new Move("M", -1), start: 0, end: 1000 },
    { move: new Move("R", -1), start: 0, end: 1000 },
    { move: new Move("U", -1), start: 1000, end: 2000 },
    { move: new Move("D", -1), start: 1000, end: 2000 },
    { move: new Move("M"), start: 2000, end: 3000 },
    { move: new Move("R"), start: 2000, end: 3000 },
  ],
  "U' E' r E r2' E r U E": [
    { move: new Move("U", -1), start: 0, end: 1000 },
    { move: new Move("E", -1), start: 0, end: 1000 },
    { move: new Move("r"), start: 1000, end: 2500 },
    { move: new Move("E"), start: 2500, end: 3500 },
    { move: new Move("r", -2), start: 3500, end: 5000 },
    { move: new Move("E"), start: 5000, end: 6000 },
    { move: new Move("r"), start: 6000, end: 7000 },
    { move: new Move("U"), start: 7000, end: 8000 },
    { move: new Move("E"), start: 7000, end: 8000 },
  ],
};

export class SimultaneousMoveIndexer<P extends PuzzleWrapper>
  implements AlgIndexer<P>
{
  private moves: MoveWithRange[];
  // TODO: Allow custom `durationFn`.

  constructor(private puzzle: P, alg: Alg) {
    this.moves = demos[alg.toString()] ?? simulMoves(alg);
    // TODO: Avoid assuming all base moves are block moves.
  }

  public getMove(index: number): Move {
    return this.moves[Math.min(index, this.moves.length - 1)].move;
  }

  private getMoveWithRange(index: number): MoveWithRange {
    return this.moves[Math.min(index, this.moves.length - 1)];
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    let start = 0;
    if (this.moves.length > 0) {
      start = this.moves[Math.min(index, this.moves.length - 1)].start;
    }
    return start;
  }

  public timestampToIndex(timestamp: Timestamp): number {
    let i = 0;
    for (i = 0; i < this.moves.length; i++) {
      if (this.moves[i].start >= timestamp) {
        return Math.max(0, i - 1);
      }
    }
    return Math.max(0, i - 1);
  }

  public timestampToPosition(
    timestamp: Timestamp,
    startTransformation?: State<P>,
  ): PuzzlePosition {
    const currentMoveInfo = this.currentMoveInfo(timestamp);

    let state = startTransformation ?? this.puzzle.identity();
    for (const moveWithRange of this.moves.slice(
      0,
      currentMoveInfo.stateIndex,
    )) {
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromMove(moveWithRange.move),
      );
    }

    return {
      state: state as any,
      movesInProgress: currentMoveInfo.currentMoves,
    };
  }

  public currentMoveInfo(timestamp: Timestamp): CurrentMoveInfo {
    const currentMoves: CurrentMove[] = [];
    const movesStarting: CurrentMove[] = [];
    const movesFinishing: CurrentMove[] = [];
    let stateIndex: number = 0;
    let latestStart: number = -Infinity; // TODO: is there a better way to accumulate this?
    let earliestEnd: number = Infinity; // TODO: is there a better way to accumulate this?
    for (const moveWithRange of this.moves) {
      if (moveWithRange.end <= timestamp) {
        stateIndex++;
      } else if (
        moveWithRange.start < timestamp &&
        timestamp < moveWithRange.end
      ) {
        const fraction =
          (timestamp - moveWithRange.start) /
          (moveWithRange.end - moveWithRange.start);
        const currentMove = {
          move: moveWithRange.move,
          direction: Direction.Forwards,
          fraction,
          startTimestamp: moveWithRange.start,
          endTimestamp: moveWithRange.end,
        };
        switch (fraction) {
          case 0:
            movesStarting.push(currentMove);
            break;
          case 1:
            movesFinishing.push(currentMove);
            break;
          default:
            currentMoves.push(currentMove);
            latestStart = Math.max(latestStart, moveWithRange.start);
            earliestEnd = Math.min(earliestEnd, moveWithRange.end);
        }
      } else if (timestamp < moveWithRange.start) {
        continue; // TODO: break?
      }
    }
    return {
      stateIndex,
      currentMoves,
      latestStart,
      earliestEnd,
      movesStarting,
      movesFinishing,
    };
  }

  public stateAtIndex(index: number, startTransformation?: State<P>): State<P> {
    let state = startTransformation ?? this.puzzle.startState();
    for (let i = 0; i < this.moves.length && i < index; i++) {
      const moveWithRange = this.moves[i];
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromMove(moveWithRange.move),
      );
    }
    return state;
  }

  public transformAtIndex(index: number): State<P> {
    let state = this.puzzle.identity();
    for (const moveWithRange of this.moves.slice(0, index)) {
      state = this.puzzle.combine(
        state,
        this.puzzle.stateFromMove(moveWithRange.move),
      );
    }
    return state;
  }

  public algDuration(): Duration {
    let max = 0;
    for (const moveWithRange of this.moves) {
      max = Math.max(max, moveWithRange.end);
    }
    return max;
  }

  public numAnimatedLeaves(): number {
    // TODO: Cache internally once performance matters.
    return this.moves.length;
  }

  public moveDuration(index: number): number {
    const move = this.getMoveWithRange(index);
    return move.end - move.start;
  }
}
