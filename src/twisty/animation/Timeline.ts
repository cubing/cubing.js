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

export class Timeline
  implements TimelineTimestampDispatcher, TimelineActionDispatcher {
  animating: boolean = false;
  private timestampListeners: Set<TimelineTimestampListener> = new Set();
  private actionListeners: Set<TimelineActionListener> = new Set();
  timestamp: number = 0;
  lastAnimFrameTimestamp: DOMHighResTimeStamp = 0;
  private scheduler: RenderScheduler;
  constructor() {
    /*...*/

    const animFrame = (): void => {
      this.timestamp =
        this.timestamp + (Date.now() - this.lastAnimFrameTimestamp);

      for (const listener of this.timestampListeners) {
        listener.onTimelineTimestampChange(this.timestamp);
      }

      if (this.animating) {
        this.scheduler.requestAnimFrame();
      }
    };
    this.scheduler = new RenderScheduler(animFrame);
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
      this.lastAnimFrameTimestamp = Date.now();
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

  setTimestamp(timestamp: MillisecondTimestamp): void {
    const oldTimestamp = this.timestamp;
    this.timestamp = timestamp;
    if (this.animating) {
      this.lastAnimFrameTimestamp = Date.now();
    }

    if (oldTimestamp !== timestamp) {
      this.dispatchAction(TimelineAction.Jumping);
      this.scheduler.requestAnimFrame();
    }
  }

  private dispatchAction(event: TimelineAction): void {
    const locationType = TimestampLocationType.StartOfTimeline; // TODO
    for (const listener of this.actionListeners) {
      listener.onTimelineAction({ action: event, locationType });
    }
  }
}
