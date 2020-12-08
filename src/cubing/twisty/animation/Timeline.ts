import { RenderScheduler } from "./RenderScheduler";
import { AlgCursor, TimeRange } from "./cursor/AlgCursor";
import {
  BoundaryType,
  Direction,
  directionScalar,
  MillisecondTimestamp,
} from "./cursor/CursorTypes";

// YouTube keeps playing on jump, but it also stays frozen while the cursor is
// down. So I think it would be good for this to be false, but only if we
// implement a "start jumping" event that pauses until "finish jumping" while
// the scrubber is active.
const PAUSE_ON_JUMP = true;

// TODO: We use symbols to avoid exposing `number` values. Is this performant enough? Should/can we use symbols?
export enum TimelineAction {
  StartingToPlay = "StartingToPlay", // TODO playing backwards.
  Pausing = "Pausing",
  Jumping = "Jumping",
}

// TODO: We use symbols to avoid exposing `number` values. Is this performant enough? Should/can we use symbols?
export enum TimestampLocationType {
  StartOfTimeline = "Start",
  EndOfTimeline = "End",
  StartOfMove = "StartOfMove",
  EndOfMove = "EndOfMove",
  MiddleOfMove = "MiddleOfMove",
  BetweenMoves = "BetweenMoves",
}

export interface TimelineActionEvent {
  action: TimelineAction;
  locationType: TimestampLocationType;
}

// This should be used by classes that (directly or indirectly) update puzzle
// state based on a timestamp. It fires every time the timestamp is changed for
// a new render (e.g. 60 times a second during animation), and only fires if the
// timestamp has changed since the last call. This means you can use it as a
// reliable callback telling you when to schedule a new render.
export interface TimelineTimestampListener {
  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void;
  onTimeRangeChange(timeRange: TimeRange): void;
}

// This should be used by classes that (directly or indirectly) update UI (e.g.
// pause/play buttons).
//
// Note: the action events of a `Timeline` are not necessarily coordinated with
// the timestamp events, since timestamp events are tied to animation frames.
// For example, if you receive a "pausing" event, the final frame may already
// have been drawn, or may be drawn in the near future.
export interface TimelineActionListener {
  onTimelineAction(actionEvent: TimelineActionEvent): void;
}

export interface TimelineTimestampDispatcher {
  addTimestampListener(timestampListener: TimelineTimestampListener): void;
}

export interface TimelineActionDispatcher {
  addActionListener(actionListener: TimelineActionListener): void;
}

// `performance.now()` is rounded for security concerns, so it's usually not
// accurate to the millisecond. So we round it, which lets us work with whole ms
// everywhere.
function getNow(): MillisecondTimestamp {
  return Math.round(performance.now());
}

export class Timeline
  implements TimelineTimestampDispatcher, TimelineActionDispatcher {
  animating: boolean = false;
  tempoScale: number = 1;
  private cursors: Set<AlgCursor> = new Set();
  private timestampListeners: Set<TimelineTimestampListener> = new Set();
  private actionListeners: Set<TimelineActionListener> = new Set();
  timestamp: number = 0;
  lastAnimFrameNow: DOMHighResTimeStamp = 0;
  lastAnimFrameTimestamp: MillisecondTimestamp;
  private scheduler: RenderScheduler;

  direction: Direction.Backwards | Direction.Forwards = Direction.Forwards; // TODO: handle pausing here?

  boundaryType: BoundaryType = BoundaryType.EntireTimeline;
  cachedNextBoundary: MillisecondTimestamp;

  constructor() {
    const animFrame = (_now: MillisecondTimestamp): void => {
      if (this.animating) {
        const now = getNow(); // TODO: See if we can use the rAF value without monotonicity issues.;
        this.timestamp =
          this.timestamp +
          this.tempoScale *
            directionScalar(this.direction) *
            (now - this.lastAnimFrameNow);
        this.lastAnimFrameNow = now;

        const atOrPastBoundary =
          this.direction === Direction.Backwards
            ? this.timestamp <= this.cachedNextBoundary
            : this.timestamp >= this.cachedNextBoundary;
        if (atOrPastBoundary) {
          this.timestamp = this.cachedNextBoundary;
          if (this.animating) {
            this.animating = false;
            this.dispatchAction(TimelineAction.Pausing);
          }
        }
      }

      if (this.timestamp !== this.lastAnimFrameTimestamp) {
        this.dispatchTimestamp();
        this.lastAnimFrameTimestamp = this.timestamp;
      }

      if (this.animating) {
        this.scheduler.requestAnimFrame();
      }
    };
    this.scheduler = new RenderScheduler(animFrame);
  }

  public addCursor(cursor: AlgCursor): void {
    this.cursors.add(cursor);
    this.dispatchTimeRange();
  }

  removeCursor(cursor: AlgCursor): void {
    this.cursors.delete(cursor);
    this.clampTimestampToRange();
    this.dispatchTimeRange();
  }

  // TODO: test
  private clampTimestampToRange(): void {
    const timeRange = this.timeRange();
    if (this.timestamp < timeRange.start) {
      this.setTimestamp(timeRange.start);
    }
    if (this.timestamp > timeRange.end) {
      this.setTimestamp(timeRange.end);
    }
  }

  // In the future, this might do some calculations or caching.
  public onCursorChange(_cursor: AlgCursor): void {
    if (this.timestamp > this.maxTimestamp()) {
      this.timestamp = this.maxTimestamp();
    }
    this.dispatchTimeRange();
  }

  timeRange(): TimeRange {
    let start = 0;
    let end = 0;
    for (const cursor of this.cursors) {
      const cursorTimeRange = cursor.timeRange();
      start = Math.min(start, cursorTimeRange.start);
      end = Math.max(end, cursorTimeRange.end);
    }

    return { start, end };
  }

  minTimestamp(): number {
    // TODO: Calculate and cache this value every time there's a new cursor.
    return this.timeRange().start;
  }

  maxTimestamp(): number {
    // TODO: Calculate and cache this value every time there's a new cursor.
    return this.timeRange().end;
  }

  private dispatchTimeRange(): void {
    const timeRange = this.timeRange();
    for (const listener of this.cursors) {
      // TODO: dedup in case the timestamp hasn't changed sine last time.
      listener.onTimeRangeChange(timeRange);
    }
    // TODO: Combine loops without extra memory?
    for (const listener of this.timestampListeners) {
      // TODO: dedup in case the timestamp hasn't changed sine last time.
      listener.onTimeRangeChange(timeRange);
    }
  }

  private dispatchTimestamp(): void {
    for (const listener of this.cursors) {
      // TODO: dedup in case the timestamp hasn't changed sine last time.
      listener.onTimelineTimestampChange(this.timestamp);
    }
    // TODO: Combine loops without extra memory?
    for (const listener of this.timestampListeners) {
      // TODO: dedup in case the timestamp hasn't changed sine last time.
      listener.onTimelineTimestampChange(this.timestamp);
    }
  }

  addTimestampListener(timestampListener: TimelineTimestampListener): void {
    this.timestampListeners.add(timestampListener);
  }

  removeTimestampListener(timestampListener: TimelineTimestampListener): void {
    this.timestampListeners.delete(timestampListener);
  }

  addActionListener(actionListener: TimelineActionListener): void {
    this.actionListeners.add(actionListener);
  }

  removeActionListener(actionListener: TimelineActionListener): void {
    this.actionListeners.delete(actionListener);
  }

  play(): void {
    this.experimentalPlay(Direction.Forwards, BoundaryType.EntireTimeline);
  }

  experimentalPlay(
    direction: Direction.Backwards | Direction.Forwards,
    boundaryType: BoundaryType = BoundaryType.EntireTimeline,
  ): void {
    this.direction = direction;
    this.boundaryType = boundaryType;
    const nextBoundary = this.nextBoundary(
      this.timestamp,
      direction,
      this.boundaryType,
    );
    if (nextBoundary === null) {
      return; // Nowhere to end, so we don't animate.
    }
    this.cachedNextBoundary = nextBoundary;
    if (!this.animating) {
      this.animating = true;
      this.lastAnimFrameNow = getNow();
      this.dispatchAction(TimelineAction.StartingToPlay);
      this.scheduler.requestAnimFrame();
    }
  }

  // Non-inclusive
  private nextBoundary(
    timestamp: MillisecondTimestamp,
    direction: Direction.Backwards | Direction.Forwards,
    boundaryType: BoundaryType = BoundaryType.EntireTimeline,
  ): MillisecondTimestamp | null {
    switch (boundaryType) {
      case BoundaryType.EntireTimeline: {
        switch (direction) {
          case Direction.Backwards:
            return timestamp <= this.minTimestamp()
              ? null
              : this.minTimestamp();
          case Direction.Forwards:
            return timestamp >= this.maxTimestamp()
              ? null
              : this.maxTimestamp();
          default:
            throw new Error("invalid direction");
        }
      }
      case BoundaryType.Move: {
        let result: null | MillisecondTimestamp = null;
        for (const cursor of this.cursors) {
          const boundaryTimestamp = cursor.moveBoundary(timestamp, direction);
          if (boundaryTimestamp !== null) {
            switch (direction) {
              case Direction.Backwards: {
                result = Math.min(
                  result ?? boundaryTimestamp,
                  boundaryTimestamp,
                );
                break;
              }
              case Direction.Forwards: {
                result = Math.max(
                  result ?? boundaryTimestamp,
                  boundaryTimestamp,
                );
                break;
              }
              default:
                throw new Error("invalid direction");
            }
          }
        }
        return result;
      }
      default:
        throw new Error("invalid boundary type");
    }
  }

  // One more render may be dispatched after this.
  pause(): void {
    // TODO: error if already paused?
    if (this.animating) {
      this.animating = false;
      this.dispatchAction(TimelineAction.Pausing);
      this.scheduler.requestAnimFrame();
    }
  }

  playPause(): void {
    if (this.animating) {
      this.pause();
    } else {
      if (this.timestamp >= this.maxTimestamp()) {
        this.timestamp = 0;
      }
      this.experimentalPlay(Direction.Forwards, BoundaryType.EntireTimeline);
    }
  }

  setTimestamp(timestamp: MillisecondTimestamp): void {
    const oldTimestamp = this.timestamp;
    this.timestamp = timestamp;
    this.lastAnimFrameNow = getNow();

    if (oldTimestamp !== timestamp) {
      this.dispatchAction(TimelineAction.Jumping);
      this.scheduler.requestAnimFrame();
    }

    if (PAUSE_ON_JUMP) {
      this.animating = false;
      this.dispatchAction(TimelineAction.Pausing);
    }
  }

  jumpToStart(): void {
    this.setTimestamp(this.minTimestamp());
  }

  jumpToEnd(): void {
    this.setTimestamp(this.maxTimestamp());
  }

  /** @deprecated */
  experimentalJumpToLastMove(): void {
    let max: MillisecondTimestamp = 0;
    for (const cursor of this.cursors) {
      max = Math.max(
        max,
        cursor.experimentalTimestampForStartOfLastMove() ?? 0,
      );
    }
    this.setTimestamp(max);
  }

  private dispatchAction(event: TimelineAction): void {
    let locationType = TimestampLocationType.MiddleOfMove; // TODO
    switch (this.timestamp) {
      // TODO
      case this.minTimestamp():
        locationType = TimestampLocationType.StartOfTimeline;
        break;
      case this.maxTimestamp():
        locationType = TimestampLocationType.EndOfTimeline;
        break;
    }

    const actionEvent: TimelineActionEvent = {
      action: event,
      locationType,
    };
    for (const listener of this.actionListeners) {
      listener.onTimelineAction(actionEvent);
    }
  }
}
