import {
  algToString,
  BareBlockMove,
  BlockMove,
  Sequence,
} from "../../../../alg";
import { PuzzleWrapper, State } from "../../../3D/puzzles/KPuzzleWrapper";
import {
  Direction,
  Duration,
  PuzzlePosition,
  Timestamp,
} from "../../cursor/CursorTypes";
import { AlgIndexer } from "../AlgIndexer";
import { MoveWithRange, simulMoves } from "./simul-moves";

const demos: Record<string, MoveWithRange[]> = {
  "y' y' U' E D R2 r2 F2 B2 U E D' R2 L2' z2 S2 U U D D S2 F2' B2": [
    { move: BareBlockMove("y", -1), start: 0, end: 1000 },
    { move: BareBlockMove("y", -1), start: 1000, end: 2000 },
    { move: BareBlockMove("U", -1), start: 1000, end: 1600 },
    { move: BareBlockMove("E", 1), start: 1200, end: 1800 },
    { move: BareBlockMove("D"), start: 1400, end: 2000 },
    { move: BareBlockMove("R", 2), start: 2000, end: 3500 },
    { move: BareBlockMove("r", 2), start: 2000, end: 3500 },
    { move: BareBlockMove("F", 2), start: 3500, end: 4200 },
    { move: BareBlockMove("B", 2), start: 3800, end: 4500 },
    { move: BareBlockMove("U", 1), start: 4500, end: 5500 },
    { move: BareBlockMove("E", 1), start: 4500, end: 5500 },
    { move: BareBlockMove("D", -1), start: 4500, end: 5500 },
    { move: BareBlockMove("R", 2), start: 5500, end: 6500 },
    { move: BareBlockMove("L", -2), start: 5500, end: 6500 },
    { move: BareBlockMove("z", 2), start: 5500, end: 6500 },
    { move: BareBlockMove("S", 2), start: 6500, end: 7500 },
    { move: BareBlockMove("U"), start: 7500, end: 8000 },
    { move: BareBlockMove("U"), start: 8000, end: 8500 },
    { move: BareBlockMove("D"), start: 7750, end: 8250 },
    { move: BareBlockMove("D"), start: 8250, end: 8750 },
    { move: BareBlockMove("S", 2), start: 8750, end: 9250 },
    { move: BareBlockMove("F", -2), start: 8750, end: 10000 },
    { move: BareBlockMove("B", 2), start: 8750, end: 10000 },
  ],
  "M' R' U' D' M R": [
    { move: BareBlockMove("M", -1), start: 0, end: 1000 },
    { move: BareBlockMove("R", -1), start: 0, end: 1000 },
    { move: BareBlockMove("U", -1), start: 1000, end: 2000 },
    { move: BareBlockMove("D", -1), start: 1000, end: 2000 },
    { move: BareBlockMove("M"), start: 2000, end: 3000 },
    { move: BareBlockMove("R"), start: 2000, end: 3000 },
  ],
  "U' E' r E r2' E r U E": [
    { move: BareBlockMove("U", -1), start: 0, end: 1000 },
    { move: BareBlockMove("E", -1), start: 0, end: 1000 },
    { move: BareBlockMove("r"), start: 1000, end: 2500 },
    { move: BareBlockMove("E"), start: 2500, end: 3500 },
    { move: BareBlockMove("r", -2), start: 3500, end: 5000 },
    { move: BareBlockMove("E"), start: 5000, end: 6000 },
    { move: BareBlockMove("r"), start: 6000, end: 7000 },
    { move: BareBlockMove("U"), start: 7000, end: 8000 },
    { move: BareBlockMove("E"), start: 7000, end: 8000 },
  ],
};

export class SimultaneousMoveIndexer<P extends PuzzleWrapper>
  implements AlgIndexer<P> {
  private moves: MoveWithRange[];
  // TODO: Allow custom `durationFn`.

  constructor(private puzzle: P, alg: Sequence) {
    this.moves = demos[algToString(alg)] ?? simulMoves(alg);
    // TODO: Avoid assuming all base moves are block moves.
  }

  public getMove(index: number): BlockMove {
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
    const position: PuzzlePosition = {
      state: startTransformation ?? (this.puzzle.identity() as any),
      movesInProgress: [],
    };
    for (const moveWithRange of this.moves) {
      if (moveWithRange.end <= timestamp) {
        position.state = this.puzzle.combine(
          position.state,
          this.puzzle.stateFromMove(moveWithRange.move),
        ) as any;
      } else if (
        moveWithRange.start < timestamp &&
        timestamp < moveWithRange.end
      ) {
        position.movesInProgress.push({
          move: moveWithRange.move,
          direction: Direction.Forwards,
          fraction:
            (timestamp - moveWithRange.start) /
            (moveWithRange.end - moveWithRange.start),
        });
      } else if (timestamp < moveWithRange.start) {
        continue;
      }
    }
    return position;
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

  public numMoves(): number {
    // TODO: Cache internally once performance matters.
    return this.moves.length;
  }

  public moveDuration(index: number): number {
    const move = this.getMoveWithRange(index);
    return move.end - move.start;
  }
}
