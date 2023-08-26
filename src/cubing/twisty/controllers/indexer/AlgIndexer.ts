import type { Move } from "../../../alg/alg-nodes";
import type { KTransformation } from "../../../kpuzzle";
import type { KPattern } from "../../../kpuzzle/KPattern";
import { arrayEqualsCompare } from "../../model/helpers";
import type {
  Direction,
  Duration,
  MillisecondTimestamp,
  PuzzlePosition,
  Timestamp,
} from "../AnimationTypes";
import type { AnimatedLeafAlgNode } from "./simultaneous-moves/simul-moves";

export interface CurrentMove {
  move: Move;
  direction: Direction; // TODO: `animationDirection`?
  fraction: number; // TODO: Figure out how to separate this field to make this whole object easier to cache?
  startTimestamp: MillisecondTimestamp;
  endTimestamp: MillisecondTimestamp;
}

export function currentMoveEquals(cm1: CurrentMove, cm2: CurrentMove): boolean {
  return (
    cm1 === cm2 ||
    (cm1.move.isIdentical(cm2.move) &&
      cm1.direction === cm2.direction &&
      cm1.fraction === cm2.fraction &&
      cm1.startTimestamp === cm2.startTimestamp &&
      cm1.endTimestamp === cm2.endTimestamp)
  );
}

export function currentMoveArrayEquals(
  cma1: CurrentMove[],
  cma2: CurrentMove[],
): boolean {
  return arrayEqualsCompare(cma1, cma2, currentMoveEquals);
}

export interface CurrentMoveInfo {
  patternIndex: number;
  // Note: some moves may not be part of the alg!
  currentMoves: CurrentMove[];
  // Moves that are reaching a fraction of 1 at this exact timestamp.
  movesFinishing: CurrentMove[];
  // Moves that are reached a fraction of 1 in the past, but are needed to
  // handle simultaneous move animation (e.g. because a move that started
  // earlier is still not done).
  movesFinished: CurrentMove[];
  movesStarting: CurrentMove[];
  latestStart: number;
  earliestEnd: number;
}

// TODO: Write tests fore this before using.
export function currentMoveInfoEquals(
  c1: CurrentMoveInfo,
  c2: CurrentMoveInfo,
): boolean {
  const eq =
    c1 === c2 ||
    (c1.patternIndex === c2.patternIndex &&
      currentMoveArrayEquals(c1.currentMoves, c2.currentMoves) &&
      currentMoveArrayEquals(c1.movesFinishing, c2.movesFinishing) &&
      currentMoveArrayEquals(c1.movesStarting, c2.movesStarting) &&
      c1.latestStart === c2.latestStart &&
      c1.earliestEnd === c2.earliestEnd);
  return eq;
}

export interface AlgIndexer {
  getAnimLeaf(index: number): AnimatedLeafAlgNode | null;
  indexToMoveStartTimestamp(index: number): Timestamp;
  patternAtIndex(index: number, startPattern?: KPattern): KPattern;
  transformationAtIndex(index: number): KTransformation;
  numAnimatedLeaves(): number;
  timestampToIndex(timestamp: Timestamp): number;
  algDuration(): Duration;
  moveDuration(index: number): number;
  timestampToPosition?: (
    timestamp: Timestamp,
    startPattern?: KPattern,
  ) => PuzzlePosition;
  currentMoveInfo?: (timestamp: Timestamp) => CurrentMoveInfo;
}
