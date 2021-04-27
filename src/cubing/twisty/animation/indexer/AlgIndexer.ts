import type { Move } from "../../../alg";
import type { PuzzleWrapper, State } from "../../3D/puzzles/KPuzzleWrapper";
import type {
  Duration,
  PuzzlePosition,
  Timestamp,
} from "../cursor/CursorTypes";

export interface AlgIndexer<P extends PuzzleWrapper> {
  getMove(index: number): Move | null;
  indexToMoveStartTimestamp(index: number): Timestamp;
  stateAtIndex(index: number, startTransformation?: State<P>): State<P>;
  transformAtIndex(index: number): State<P>;
  numMoves(): number;
  timestampToIndex(timestamp: Timestamp): number;
  algDuration(): Duration;
  moveDuration(index: number): number;
  timestampToPosition?: (
    timestamp: Timestamp,
    startTransformation?: State<P>,
  ) => PuzzlePosition;
}
