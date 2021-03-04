/* eslint-disable no-case-declarations */
// TODO: private vs. public properties/methods.
// TODO: optional construtor arguments for DOM elements
// TODO: figure out what can be moved into a worker using OffscreenCanvas https://developers.google.com/web/updates/2018/08/offscreen-canvas

/* eslint-disable @typescript-eslint/no-empty-interface */

// start of imports
import { Alg } from "../../../alg";
import { KPuzzle, KPuzzleDefinition, Transformation } from "../../../kpuzzle";
import { KPuzzleWrapper } from "../../3D/puzzles/KPuzzleWrapper";
import { AlgIndexer } from "../indexer/AlgIndexer";
import { TreeAlgIndexer } from "../indexer/tree/TreeAlgIndexer";
import { Timeline, TimelineTimestampListener } from "../Timeline";
import {
  Direction,
  directionScalar,
  MillisecondTimestamp,
  PuzzlePosition,
} from "./CursorTypes";
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

type IndexerConstructor = new (puzzle: KPuzzleWrapper, alg: Alg) => AlgIndexer<
  KPuzzleWrapper
>;

export class AlgCursor
  implements TimelineTimestampListener, PositionDispatcher {
  private indexer: AlgIndexer<KPuzzleWrapper>;
  private positionListeners: Set<PositionListener> = new Set(); // TODO: accessor instead of direct access
  private ksolvePuzzle: KPuzzleWrapper;
  private startState: Transformation;
  private indexerConstructor: IndexerConstructor = TreeAlgIndexer;
  constructor(
    private timeline: Timeline,
    private def: KPuzzleDefinition,
    private alg: Alg,
    startStateAlg?: Alg, // TODO: accept actual start state
  ) {
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    this.instantiateIndexer(alg);
    this.startState = startStateAlg
      ? this.algToState(startStateAlg)
      : this.ksolvePuzzle.startState();
    timeline.addTimestampListener(this);
  }

  setStartState(startState: Transformation): void {
    this.startState = startState;
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }

  /** @deprecated */
  public experimentalSetIndexer(indexerConstructor: IndexerConstructor): void {
    this.indexerConstructor = indexerConstructor;
    this.instantiateIndexer(this.alg);
    this.timeline.onCursorChange(this);
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
  }

  private instantiateIndexer(alg: Alg): void {
    this.indexer = new this.indexerConstructor(this.ksolvePuzzle, alg);
  }

  /** @deprecated */
  algToState(s: Alg): Transformation {
    const kpuzzle = new KPuzzle(this.def);
    kpuzzle.applyAlg(s);
    return this.ksolvePuzzle.combine(this.def.startPieces, kpuzzle.state);
  }

  timeRange(): TimeRange {
    return {
      start: 0,
      end: this.indexer.algDuration(),
    };
  }

  /** @deprecated */
  experimentalTimestampForStartOfLastMove(): MillisecondTimestamp {
    const numMoves = this.indexer.numMoves();
    if (numMoves > 0) {
      return this.indexer.indexToMoveStartTimestamp(numMoves - 1);
    }
    return 0;
  }

  addPositionListener(positionListener: PositionListener): void {
    this.positionListeners.add(positionListener);
    this.dispatchPositionForTimestamp(this.timeline.timestamp, [
      positionListener,
    ]); // TODO: should this be a separate dispatch, or should the listener manually ask for the position?
  }

  removePositionListener(positionListener: PositionListener): void {
    this.positionListeners.delete(positionListener);
  }

  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void {
    this.dispatchPositionForTimestamp(timestamp);
  }

  private dispatchPositionForTimestamp(
    timestamp: MillisecondTimestamp,
    listeners: PositionListener[] | Set<PositionListener> = this
      .positionListeners,
  ): void {
    let position: PuzzlePosition;
    if (this.indexer.timestampToPosition) {
      position = this.indexer.timestampToPosition(timestamp, this.startState);
    } else {
      const idx = this.indexer.timestampToIndex(timestamp);
      const state = this.indexer.stateAtIndex(idx, this.startState) as any; // TODO
      position = {
        state,
        movesInProgress: [],
      };

      if (this.indexer.numMoves() > 0) {
        const fraction =
          (timestamp - this.indexer.indexToMoveStartTimestamp(idx)) /
          this.indexer.moveDuration(idx);
        if (fraction === 1) {
          // TODO: push this into the indexer
          position.state = this.ksolvePuzzle.combine(
            state,
            this.ksolvePuzzle.stateFromMove(this.indexer.getMove(idx)!),
          ) as Transformation;
        } else if (fraction > 0) {
          const move = this.indexer.getMove(idx);
          if (move) {
            position.movesInProgress.push({
              move,
              direction: Direction.Forwards,
              fraction,
            });
          }
        }
      }
    }

    for (const listener of listeners) {
      listener.onPositionChange(position);
    }
  }

  onTimeRangeChange(_timeRange: TimeRange): void {
    // nothing to do
  }

  setAlg(alg: Alg): void {
    this.alg = alg;
    this.instantiateIndexer(alg);
    this.timeline.onCursorChange(this);
    this.dispatchPositionForTimestamp(this.timeline.timestamp);
    // TODO: Handle state change.
  }

  moveBoundary(
    timestamp: MillisecondTimestamp,
    direction: Direction.Backwards | Direction.Forwards,
  ): MillisecondTimestamp | null {
    if (this.indexer.numMoves() === 0) {
      return null;
    }
    // TODO: define semantics of indexing edge cases and remove this hack.
    const offsetHack = directionScalar(direction) * 0.001;
    const idx = this.indexer.timestampToIndex(timestamp + offsetHack);
    const moveStart = this.indexer.indexToMoveStartTimestamp(idx);

    if (direction === Direction.Backwards) {
      return timestamp >= moveStart ? moveStart : null;
    } else {
      const moveEnd = moveStart + this.indexer.moveDuration(idx);
      return timestamp <= moveEnd ? moveEnd : null;
    }
  }

  setPuzzle(
    def: KPuzzleDefinition,
    alg: Alg = this.alg,
    startStateAlg?: Alg,
  ): void {
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    this.def = def;
    this.indexer = new this.indexerConstructor(this.ksolvePuzzle, alg);
    if (alg !== this.alg) {
      this.timeline.onCursorChange(this);
    }
    this.setStartState(
      startStateAlg
        ? this.algToState(startStateAlg)
        : this.ksolvePuzzle.startState(),
    );
    this.alg = alg;
  }

  /** @deprecated */
  experimentalTimestampFromIndex(index: number): MillisecondTimestamp {
    return this.indexer.indexToMoveStartTimestamp(index);
  }

  /** @deprecated */
  experimentalIndexFromTimestamp(timestamp: MillisecondTimestamp): number {
    return this.indexer.timestampToIndex(timestamp);
  }
}
