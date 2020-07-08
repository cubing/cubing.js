/* eslint-disable no-case-declarations */
// TODO: private vs. public properties/methods.
// TODO: optional construtor arguments for DOM elements
// TODO: figure out what can be moved into a worker using OffscreenCanvas https://developers.google.com/web/updates/2018/08/offscreen-canvas

/* eslint-disable @typescript-eslint/no-empty-interface */

// start of imports
import { AlgPart, Sequence } from "../../../alg";
import { Transformation as KPuzzleState } from "../../../kpuzzle";
import {
  TimelineTimestampListener,
  Timeline,
  MillisecondTimestamp,
} from "../Timeline";
import { AlgIndexer } from "./AlgIndexer";
// end of imports

// Model

export type Fraction = number; // Value from 0 to 1.
export enum Direction {
  Forwards = 1,
  Paused = 0,
  Backwards = -1,
}
export interface MoveProgress {
  move: AlgPart;
  direction: Direction;
  fraction: number;
}
export interface MoveInProgress {
  state: KPuzzleState;
  moves: MoveProgress[];
}
export type PuzzlePosition = [KPuzzleState, MoveInProgress[]];

export interface PositionListener {
  onPositionChange(position: PuzzlePosition): void;
}

export interface PositionDispatcher {
  addPositionListener(positionListener: PositionListener): void;
}

export class AlgCursor
  implements TimelineTimestampListener, PositionDispatcher {
  private indexer: AlgIndexer;
  private positionListeners: Set<PositionListener> = new Set(); // TODO: accessor instead of direct access
  constructor(timeline: Timeline, alg: Sequence) {
    timeline.addTimestampListener(this);
    this.indexer = new AlgIndexer(alg);
    /*...*/
  }

  addPositionListener(positionListener: PositionListener): void {
    this.positionListeners.add(positionListener);
  }

  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void {
    const position = this.indexer.getPosition(timestamp);
    for (const listener of this.positionListeners) {
      listener.onPositionChange(position);
    }
  }
}
