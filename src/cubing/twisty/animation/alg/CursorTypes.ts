import { AlgPart } from "../../../alg";
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
  move: AlgPart;
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

export type DurationForAmount = (amount: number) => Duration;
// eslint-disable-next-line no-inner-declarations

export function ConstantDurationForAmount(_amount: number): Duration {
  return 1000;
}

// eslint-disable-next-line no-inner-declarations
export function DefaultDurationForAmount(amount: number): Duration {
  switch (Math.abs(amount)) {
    case 0:
      return 0;
    case 1:
      return 1000;
    case 2:
      return 1500;
    default:
      return 2000;
  }
}
// eslint-disable-next-line no-inner-declarations
export function ExperimentalScaledDefaultDurationForAmount(
  scale: number,
  amount: number,
): Duration {
  switch (Math.abs(amount)) {
    case 0:
      return 0;
    case 1:
      return scale * 1000;
    case 2:
      return scale * 1500;
    default:
      return scale * 2000;
  }
}
