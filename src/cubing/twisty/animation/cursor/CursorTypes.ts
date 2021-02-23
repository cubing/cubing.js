import { Move } from "../../../alg";
import { Transformation as KPuzzleState } from "../../../kpuzzle";

export type MillisecondTimestamp = number;

// TODO: unify duration/timstamp types
export type Duration = MillisecondTimestamp; // Duration in milliseconds
// TODO: Extend `number`, introduce MoveSequenceTimestamp vs. EpochTimestamp,
// force Duration to be a difference.
export type Timestamp = MillisecondTimestamp; // Duration since a particular epoch.

export type Fraction = number; // Value from 0 to 1.

// 1, 0, -1 are used as scalars for `directionScalar` below.
export enum Direction {
  Forwards = 1,
  Paused = 0,
  Backwards = -1,
}

export function directionScalar(direction: Direction): MillisecondTimestamp {
  return direction;
}

export interface MoveInProgress {
  move: Move;
  direction: Direction;
  fraction: number;
}

export type PuzzlePosition = {
  state: KPuzzleState;
  movesInProgress: MoveInProgress[];
};

export enum BoundaryType {
  Move,
  EntireTimeline,
}

// export type DurationForAmount = (amount: number) => Duration;
