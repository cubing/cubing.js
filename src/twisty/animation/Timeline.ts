import { RenderScheduler } from "./RenderScheduler";

export type MillisecondTimestamp = number;

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
  private timestampListeners: Set<TimelineTimestampListener> = new Set();
  private actionListeners: Set<TimelineActionListener> = new Set();
  timestamp: number = 0;
  lastAnimFrameNow: DOMHighResTimeStamp = 0;
  lastAnimFrameTimestamp: MillisecondTimestamp;
  private scheduler: RenderScheduler;
  constructor() {
    const animFrame = (_now: MillisecondTimestamp): void => {
      if (this.animating) {
        const now = getNow(); // TODO: See if we can use the rAF value without monotonicity issues.;
        this.timestamp = this.timestamp + (now - this.lastAnimFrameNow);
        this.lastAnimFrameNow = now;
      }

      if (this.timestamp >= this.maxTimeStamp()) {
        this.timestamp = this.maxTimeStamp();
        if (this.animating) {
          this.animating = false;
          this.dispatchAction(TimelineAction.Pausing);
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

  minTimeStamp(): MillisecondTimestamp {
    return 0;
  }

  maxTimeStamp(): MillisecondTimestamp {
    return 7500; // TODO: get from cursors
  }

  dispatchTimestamp(): void {
    for (const listener of this.timestampListeners) {
      // TODO: dedup in case the timestamp hasn't changed sine last time.
      listener.onTimelineTimestampChange(this.timestamp);
    }
  }

  addTimestampListener(timestampListener: TimelineTimestampListener): void {
    this.timestampListeners.add(timestampListener);
  }

  addActionListener(actionListener: TimelineActionListener): void {
    this.actionListeners.add(actionListener);
  }

  play(): void {
    if (!this.animating) {
      this.animating = true;
      this.lastAnimFrameNow = getNow();
      this.dispatchAction(TimelineAction.StartingToPlay);
      this.scheduler.requestAnimFrame();
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
      if (this.timestamp >= this.maxTimeStamp()) {
        this.timestamp = 0;
      }
      this.play();
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
  }

  jumpToEnd(): void {
    this.setTimestamp(this.maxTimeStamp());
  }

  private dispatchAction(event: TimelineAction): void {
    let locationType = TimestampLocationType.MiddleOfMove; // TODO
    switch (this.timestamp) {
      // TODO
      case this.minTimeStamp():
        locationType = TimestampLocationType.StartOfTimeline;
        break;
      case this.maxTimeStamp():
        locationType = TimestampLocationType.EndOfTimeline;
        break;
    }

    const actionEvent: TimelineActionEvent = { action: event, locationType };
    for (const listener of this.actionListeners) {
      listener.onTimelineAction(actionEvent);
    }
  }
}
