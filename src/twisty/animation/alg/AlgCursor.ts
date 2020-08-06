/* eslint-disable no-case-declarations */
// TODO: private vs. public properties/methods.
// TODO: optional construtor arguments for DOM elements
// TODO: figure out what can be moved into a worker using OffscreenCanvas https://developers.google.com/web/updates/2018/08/offscreen-canvas

/* eslint-disable @typescript-eslint/no-empty-interface */

// start of imports
import { Sequence } from "../../../alg";
import { KPuzzleDefinition } from "../../../kpuzzle";
import { KPuzzleWrapper } from "../../3D/puzzles/KPuzzleWrapper";
import {
  MillisecondTimestamp,
  Timeline,
  TimelineTimestampListener,
} from "../Timeline";
import { TreeAlgIndexer } from "./TreeAlgIndexer";
import { PuzzlePosition, Direction, directionScalar } from "./CursorTypes";
// end of imports

// Model

export interface PositionListener {
  onPositionChange(position: PuzzlePosition): void;
}

export interface PositionDispatcher {
  addPositionListener(positionListener: PositionListener): void;
}

export interface TimeRange {
  start: MillisecondTimestamp;
  end: MillisecondTimestamp;
}

export class AlgCursor
  implements TimelineTimestampListener, PositionDispatcher {
  private todoIndexer: TreeAlgIndexer<KPuzzleWrapper>;
  private positionListeners: Set<PositionListener> = new Set(); // TODO: accessor instead of direct access
  private ksolvePuzzle: KPuzzleWrapper;
  constructor(
    private timeline: Timeline,
    def: KPuzzleDefinition,
    alg: Sequence,
  ) {
    timeline.addTimestampListener(this);
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg);
    /*...*/
  }

  timeRange(): TimeRange {
    return {
      start: 0,
      end: this.todoIndexer.algDuration(),
    };
  }

  experimentalTimestampForStartOfLastMove(): MillisecondTimestamp {
    const numMoves = this.todoIndexer.numMoves();
    if (numMoves > 0) {
      return this.todoIndexer.indexToMoveStartTimestamp(numMoves - 1);
    }
    return 0;
  }

  addPositionListener(positionListener: PositionListener): void {
    this.positionListeners.add(positionListener);
  }

  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void {
    this.dispatchPositionForTimestamp(timestamp);
  }

  dispatchPositionForTimestamp(timestamp: MillisecondTimestamp): void {
    const idx = this.todoIndexer.timestampToIndex(timestamp);
    const state = this.todoIndexer.stateAtIndex(idx) as any; // TODO
    const position: PuzzlePosition = {
      state,
      movesInProgress: [],
    };

    if (this.todoIndexer.numMoves() > 0) {
      position.movesInProgress.push({
        move: this.todoIndexer.getMove(idx),
        direction: Direction.Forwards,
        fraction:
          (timestamp - this.todoIndexer.indexToMoveStartTimestamp(idx)) /
          this.todoIndexer.moveDuration(idx),
      });
    }

    for (const listener of this.positionListeners) {
      listener.onPositionChange(position);
    }
  }

  onTimeRangeChange(_timeRange: TimeRange): void {
    // nothing to do
  }

  setAlg(alg: Sequence): void {
    this.todoIndexer = new TreeAlgIndexer(this.ksolvePuzzle, alg);
    this.timeline.onCursorChange(this);
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
    // TODO: Handle state change.
  }

  moveBoundary(
    timestamp: MillisecondTimestamp,
    direction: Direction.Backwards | Direction.Forwards,
  ): MillisecondTimestamp | null {
    if (this.todoIndexer.numMoves() === 0) {
      return null;
    }
    // TODO: define semantics of indexing edge cases and remove this hack.
    const offsetHack = directionScalar(direction) * 0.001;
    const idx = this.todoIndexer.timestampToIndex(timestamp + offsetHack);
    const moveStart = this.todoIndexer.indexToMoveStartTimestamp(idx);

    if (direction === Direction.Backwards) {
      return timestamp >= moveStart ? moveStart : null;
    } else {
      const moveEnd = moveStart + this.todoIndexer.moveDuration(idx);
      return timestamp <= moveEnd ? moveEnd : null;
    }
  }
}
