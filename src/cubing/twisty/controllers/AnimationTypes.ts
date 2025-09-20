import type { Tagged } from "type-fest";
import type { Move } from "../../alg";
import type { KPattern } from "../../kpuzzle/KPattern";

export type MillisecondTimestamp = Tagged<
  DOMHighResTimeStamp,
  "MillisecondTimestamp"
>;

// TODO: unify duration/timstamp types
export type MillisecondDuration = Tagged<number, "MillisecondDuration">; // Duration in milliseconds
// TODO: Extend `number`, introduce MoveSequenceTimestamp vs. EpochTimestamp,
// force Duration to be a difference.

export type Fraction = number; // Value from 0 to 1.

// 1, 0, -1 are used as scalars for `directionScalar` below.
export enum Direction {
  Forwards = 1,
  Paused = 0,
  Backwards = -1,
}

export function directionScalar(direction: Direction): number {
  return direction;
}

export interface MoveInProgress {
  move: Move;
  direction: Direction;
  fraction: number;
}

export type PuzzlePosition = {
  pattern: KPattern;
  movesInProgress: MoveInProgress[];
};

export enum BoundaryType {
  Move = "move",
  EntireTimeline = "entire-timeline",
}

export interface TimeRange {
  start: MillisecondTimestamp;
  end: MillisecondTimestamp;
}

// export type DurationForAmount = (amount: number) => Duration;

export interface PositionListener {
  onPositionChange(position: PuzzlePosition): void;
}
