import type { Move } from "../../../../alg";
import { arrayEqualsCompare } from "../../../model/helpers";
import type {
  PuzzleWrapper,
  State,
} from "../../../views/3D/puzzles/KPuzzleWrapper";
import type {
  Direction,
  Duration,
  MillisecondTimestamp,
  PuzzlePosition,
  Timestamp,
} from "../cursor/CursorTypes";
import type { AnimatedLeafUnit } from "./simultaneous-moves/simul-moves";

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
  stateIndex: number;
  currentMoves: CurrentMove[];
  movesFinishing: CurrentMove[];
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
    (c1.stateIndex === c2.stateIndex &&
      currentMoveArrayEquals(c1.currentMoves, c2.currentMoves) &&
      currentMoveArrayEquals(c1.movesFinishing, c2.movesFinishing) &&
      currentMoveArrayEquals(c1.movesStarting, c2.movesStarting) &&
      c1.latestStart === c2.latestStart &&
      c2.earliestEnd === c2.earliestEnd);
  return eq;
}

export interface AlgIndexer<P extends PuzzleWrapper> {
  getAnimLeaf(index: number): AnimatedLeafUnit | null;
  indexToMoveStartTimestamp(index: number): Timestamp;
  stateAtIndex(index: number, startTransformation?: State<P>): State<P>;
  transformAtIndex(index: number): State<P>;
  numAnimatedLeaves(): number;
  timestampToIndex(timestamp: Timestamp): number;
  algDuration(): Duration;
  moveDuration(index: number): number;
  timestampToPosition?: (
    timestamp: Timestamp,
    startTransformation?: State<P>,
  ) => PuzzlePosition;
  currentMoveInfo?: (timestamp: Timestamp) => CurrentMoveInfo;
}

// @ts-ignore https://github.com/snowpackjs/snowpack/discussions/1589#discussioncomment-130176
const _SNOWPACK_HACK = true;
