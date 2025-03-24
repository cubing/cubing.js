import type { AnimationTimelineLeaves } from "cubing/twisty/model/props/puzzle/state/AnimationTimelineLeavesRequestProp";
import { Move, type Alg } from "../../../../alg";
import type { KPuzzle, KTransformation } from "../../../../kpuzzle";
import type { KPattern } from "../../../../kpuzzle/KPattern";
import {
  Direction,
  type Duration,
  type PuzzlePosition,
  type Timestamp,
} from "../../AnimationTypes";
import type { CurrentMove, CurrentMoveInfo } from "../AlgIndexer";
import {
  simulMoves,
  type AnimLeafWithRange,
  type AnimatedLeafAlgNode,
} from "./simul-moves";

export class SimultaneousMoveIndexer {
  private animLeaves: AnimLeafWithRange[];
  // TODO: Allow custom `durationFn`.

  constructor(
    private kpuzzle: KPuzzle,
    alg: Alg,
    options?: { animationTimelineLeaves?: AnimationTimelineLeaves | null },
  ) {
    this.animLeaves = options?.animationTimelineLeaves ?? simulMoves(alg);
    // TODO: Avoid assuming all base moves are block moves.
  }

  public getAnimLeaf(index: number): AnimatedLeafAlgNode | null {
    return (
      this.animLeaves[Math.min(index, this.animLeaves.length - 1)]?.animLeaf ??
      null
    );
  }

  private getAnimLeafWithRange(index: number): AnimLeafWithRange {
    return this.animLeaves[Math.min(index, this.animLeaves.length - 1)];
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    let start = 0;
    if (this.animLeaves.length > 0) {
      start =
        this.animLeaves[Math.min(index, this.animLeaves.length - 1)].start;
    }
    return start;
  }

  public timestampToIndex(timestamp: Timestamp): number {
    let i = 0;
    for (i = 0; i < this.animLeaves.length; i++) {
      if (this.animLeaves[i].start >= timestamp) {
        return Math.max(0, i - 1);
      }
    }
    return Math.max(0, i - 1);
  }

  public timestampToPosition(
    timestamp: Timestamp,
    startPattern?: KPattern,
  ): PuzzlePosition {
    const currentMoveInfo = this.currentMoveInfo(timestamp);

    let pattern =
      startPattern ?? this.kpuzzle.identityTransformation().toKPattern();
    for (const leafWithRange of this.animLeaves.slice(
      0,
      currentMoveInfo.patternIndex,
    )) {
      const move = leafWithRange.animLeaf.as(Move);
      if (move !== null) {
        pattern = pattern.applyMove(move);
      }
    }

    return {
      pattern: pattern,
      movesInProgress: currentMoveInfo.currentMoves,
    };
  }

  // TODO: Caching
  public currentMoveInfo(timestamp: Timestamp): CurrentMoveInfo {
    // The starting timestamp of the earliest active move.
    let windowEarliestTimestamp = Infinity;
    for (const leafWithRange of this.animLeaves) {
      if (leafWithRange.start <= timestamp && leafWithRange.end >= timestamp) {
        windowEarliestTimestamp = Math.min(
          windowEarliestTimestamp,
          leafWithRange.start,
        );
      } else if (leafWithRange.start > timestamp) {
        break;
      }
    }

    const currentMoves: CurrentMove[] = [];
    const movesStarting: CurrentMove[] = [];
    const movesFinishing: CurrentMove[] = [];
    const movesFinished: CurrentMove[] = [];
    let latestStart: number = -Infinity; // TODO: is there a better way to accumulate this?
    let earliestEnd: number = Infinity; // TODO: is there a better way to accumulate this?

    let patternIndex: number = 0;
    for (const leafWithRange of this.animLeaves) {
      if (leafWithRange.end <= windowEarliestTimestamp) {
        patternIndex++;
      } else if (leafWithRange.start > timestamp) {
        break;
      } else {
        const move = leafWithRange.animLeaf.as(Move);
        if (move !== null) {
          let fraction =
            (timestamp - leafWithRange.start) /
            (leafWithRange.end - leafWithRange.start);
          let moveFinished = false;
          if (fraction > 1) {
            fraction = 1;
            moveFinished = true;
          }
          const currentMove = {
            move: move,
            direction: Direction.Forwards,
            fraction: fraction,
            startTimestamp: leafWithRange.start,
            endTimestamp: leafWithRange.end,
          };
          switch (fraction) {
            case 0: {
              movesStarting.push(currentMove);
              break;
            }
            case 1: {
              // Generalize this to avoid reordering commuting moves.
              if (moveFinished) {
                movesFinished.push(currentMove);
              } else {
                movesFinishing.push(currentMove);
              }
              break;
            }
            default:
              currentMoves.push(currentMove);
              latestStart = Math.max(latestStart, leafWithRange.start);
              earliestEnd = Math.min(earliestEnd, leafWithRange.end);
          }
        }
      }
    }
    return {
      patternIndex: patternIndex,
      currentMoves,
      latestStart,
      earliestEnd,
      movesStarting,
      movesFinishing,
      movesFinished,
    };
  }

  public patternAtIndex(index: number, startPattern?: KPattern): KPattern {
    let pattern = startPattern ?? this.kpuzzle.defaultPattern();
    for (let i = 0; i < this.animLeaves.length && i < index; i++) {
      const leafWithRange = this.animLeaves[i];
      const move = leafWithRange.animLeaf.as(Move);
      if (move !== null) {
        pattern = pattern.applyMove(move);
      }
    }
    return pattern;
  }

  public transformationAtIndex(index: number): KTransformation {
    let transformation = this.kpuzzle.identityTransformation();
    for (const leafWithRange of this.animLeaves.slice(0, index)) {
      const move = leafWithRange.animLeaf.as(Move);
      if (move !== null) {
        transformation = transformation.applyMove(move);
      }
    }
    return transformation;
  }

  public algDuration(): Duration {
    let max = 0;
    for (const leafWithRange of this.animLeaves) {
      max = Math.max(max, leafWithRange.end);
    }
    return max;
  }

  public numAnimatedLeaves(): number {
    // TODO: Cache internally once performance matters.
    return this.animLeaves.length;
  }

  public moveDuration(index: number): number {
    const move = this.getAnimLeafWithRange(index);
    return move.end - move.start;
  }
}
