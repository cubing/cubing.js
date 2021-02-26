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
  private todoIndexer: AlgIndexer<KPuzzleWrapper>;
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
    this.todoIndexer = new this.indexerConstructor(this.ksolvePuzzle, alg);
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
      end: this.todoIndexer.algDuration(),
    };
  }

  /** @deprecated */
  experimentalTimestampForStartOfLastTurn(): MillisecondTimestamp {
    const numTurns = this.todoIndexer.numTurns();
    if (numTurns > 0) {
      return this.todoIndexer.indexToTurnStartTimestamp(numTurns - 1);
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
    if (this.todoIndexer.timestampToPosition) {
      position = this.todoIndexer.timestampToPosition(
        timestamp,
        this.startState,
      );
    } else {
      const idx = this.todoIndexer.timestampToIndex(timestamp);
      const state = this.todoIndexer.stateAtIndex(idx, this.startState) as any; // TODO
      position = {
        state,
        turnsInProgress: [],
      };

      if (this.todoIndexer.numTurns() > 0) {
        const fraction =
          (timestamp - this.todoIndexer.indexToTurnStartTimestamp(idx)) /
          this.todoIndexer.turnDuration(idx);
        if (fraction === 1) {
          // TODO: push this into the indexer
          position.state = this.ksolvePuzzle.combine(
            state,
            this.ksolvePuzzle.stateFromTurn(this.todoIndexer.getTurn(idx)!),
          ) as Transformation;
        } else if (fraction > 0) {
          const turn = this.todoIndexer.getTurn(idx);
          if (turn) {
            position.turnsInProgress.push({
              turn,
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

  turnBoundary(
    timestamp: MillisecondTimestamp,
    direction: Direction.Backwards | Direction.Forwards,
  ): MillisecondTimestamp | null {
    if (this.todoIndexer.numTurns() === 0) {
      return null;
    }
    // TODO: define semantics of indexing edge cases and return this hack.
    const offsetHack = directionScalar(direction) * 0.001;
    const idx = this.todoIndexer.timestampToIndex(timestamp + offsetHack);
    const turnStart = this.todoIndexer.indexToTurnStartTimestamp(idx);

    if (direction === Direction.Backwards) {
      return timestamp >= turnStart ? turnStart : null;
    } else {
      const turnEnd = turnStart + this.todoIndexer.turnDuration(idx);
      return timestamp <= turnEnd ? turnEnd : null;
    }
  }

  setPuzzle(
    def: KPuzzleDefinition,
    alg: Alg = this.alg,
    startStateAlg?: Alg,
  ): void {
    this.ksolvePuzzle = new KPuzzleWrapper(def);
    this.def = def;
    this.todoIndexer = new this.indexerConstructor(this.ksolvePuzzle, alg);
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
    return this.todoIndexer.indexToTurnStartTimestamp(index);
  }

  /** @deprecated */
  experimentalIndexFromTimestamp(timestamp: MillisecondTimestamp): number {
    return this.todoIndexer.timestampToIndex(timestamp);
  }
}
