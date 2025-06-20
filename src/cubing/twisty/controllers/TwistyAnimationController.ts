import { modIntoRange } from "../model/helpers";
import { StaleDropper } from "../model/PromiseFreshener";
import type { CatchUpMove } from "../model/props/puzzle/state/CatchUpMoveProp";
import type {
  PlayingInfo,
  SimpleDirection,
} from "../model/props/timeline/PlayingInfoProp";
import type { TimestampRequest } from "../model/props/timeline/TimestampRequestProp";
import type { TwistyPlayerModel } from "../model/TwistyPlayerModel";
import {
  BoundaryType,
  Direction,
  directionScalar,
  type MillisecondTimestamp,
  type TimeRange,
} from "./AnimationTypes";
import type { CurrentMoveInfo } from "./indexer/AlgIndexer";
import { RenderScheduler } from "./RenderScheduler";

// TODO: Figure out a better way for the controller to instruct the player.
export interface TwistyAnimationControllerDelegate {
  flash(): void;
}

// We use a separate helper to separate the anim frame callbacks (and their cancellations).
// TODO: fold this into the main controller
class CatchUpHelper {
  catchingUp: boolean = false;
  pendingFrame = false;

  tempoScale: number = 1; // TODO
  constructor(private model: TwistyPlayerModel) {
    model.tempoScale.addFreshListener((tempoScale) => {
      this.tempoScale = tempoScale;
    });
  }

  private scheduler: RenderScheduler = new RenderScheduler(
    this.animFrame.bind(this),
  );

  start(): void {
    if (!this.catchingUp) {
      this.lastTimestamp = performance.now();
    }
    this.catchingUp = true;
    this.pendingFrame = true;
    this.scheduler.requestAnimFrame();
  }

  stop(): void {
    this.catchingUp = false;
    this.scheduler.cancelAnimFrame();
  }

  catchUpMs = 500;
  lastTimestamp = 0;
  animFrame(timestamp: MillisecondTimestamp): void {
    this.scheduler.requestAnimFrame();
    const delta =
      (this.tempoScale * (timestamp - this.lastTimestamp)) / this.catchUpMs;
    this.lastTimestamp = timestamp;

    this.model.catchUpMove.set(
      (async (): Promise<CatchUpMove> => {
        const previousCatchUpMove = await this.model.catchUpMove.get();
        if (previousCatchUpMove.move === null) {
          return previousCatchUpMove;
        }

        const amount = previousCatchUpMove.amount + delta; // TODO: use tempo scale?
        if (amount >= 1) {
          this.pendingFrame = true;
          this.stop();
          this.model.timestampRequest.set("end");
          return {
            move: null,
            amount: 0,
          };
        }
        this.pendingFrame = false;
        return {
          move: previousCatchUpMove.move,
          amount: amount,
        };
      })(),
    );
  }
}

// This controls the logic for animation, so that the main controller can focus on the right API abstractions.
export class TwistyAnimationController {
  // TODO: #private?
  private playing: boolean = false;
  private direction: Direction = Direction.Forwards;

  private catchUpHelper: CatchUpHelper;

  private model: TwistyPlayerModel;

  private lastDatestamp: MillisecondTimestamp = 0;
  private lastTimestampPromise: Promise<MillisecondTimestamp>;

  private scheduler: RenderScheduler = new RenderScheduler(
    this.animFrame.bind(this),
  );

  constructor(
    model: TwistyPlayerModel,
    private delegate: TwistyAnimationControllerDelegate,
  ) {
    this.model = model;
    this.lastTimestampPromise = this.#effectiveTimestampMilliseconds();

    this.model.playingInfo.addFreshListener(this.onPlayingProp.bind(this)); // TODO

    this.catchUpHelper = new CatchUpHelper(this.model);
    this.model.catchUpMove.addFreshListener(this.onCatchUpMoveProp.bind(this)); // TODO
  }

  // TODO: Do we need this?
  async onPlayingProp(playingInfo: PlayingInfo): Promise<void> {
    if (playingInfo.playing !== this.playing) {
      playingInfo.playing ? this.play(playingInfo) : this.pause();
    }
  }

  // TODO: Do we need this?
  async onCatchUpMoveProp(catchUpMove: CatchUpMove): Promise<void> {
    const catchingUp = catchUpMove.move !== null;
    if (catchingUp !== this.catchUpHelper.catchingUp) {
      catchingUp ? this.catchUpHelper.start() : this.catchUpHelper.stop();
    }
    this.scheduler.requestAnimFrame();
  }

  async #effectiveTimestampMilliseconds(): Promise<MillisecondTimestamp> {
    return (await this.model.detailedTimelineInfo.get()).timestamp;
  }

  // TODO: Return the animation we've switched to.
  jumpToStart(options?: { flash: boolean }): void {
    this.model.timestampRequest.set("start");
    this.pause();
    if (options?.flash) {
      this.delegate.flash();
    }
  }

  // TODO: Return the animation we've switched to.
  jumpToEnd(options?: { flash: boolean }): void {
    this.model.timestampRequest.set("end");
    this.pause();
    if (options?.flash) {
      this.delegate.flash();
    }
  }

  // TODO: Return the playing info we've switched to.
  playPause(): void {
    if (this.playing) {
      this.pause();
    } else {
      this.play(); // TODO: Resume direction and looping behaviour?
    }
  }

  // TODO: bundle playing direction, and boundary into `toggle`.
  async play(options?: {
    direction?: SimpleDirection;
    untilBoundary?: BoundaryType;
    autoSkipToOtherEndIfStartingAtBoundary?: boolean; // TODO What's a good short name that doesn't imply a more general looping concept?
    loop?: boolean;
  }): Promise<void> {
    // TODO: We might need to cache all playing info?
    // Or maybe we don't have to worry about short-circuiting, since this is idempotent?
    // if (this.playing) {
    //   return;
    // }

    const direction = options?.direction ?? Direction.Forwards;

    const coarseTimelineInfo = await this.model.coarseTimelineInfo.get(); // TODO: Why do we need to read this if we don't use it?
    if (options?.autoSkipToOtherEndIfStartingAtBoundary ?? true) {
      if (direction === Direction.Forwards && coarseTimelineInfo.atEnd) {
        this.model.timestampRequest.set("start");
        this.delegate.flash();
      }
      if (direction === Direction.Backwards && coarseTimelineInfo.atStart) {
        this.model.timestampRequest.set("end");
        this.delegate.flash();
      }
    }
    this.model.playingInfo.set({
      playing: true,
      direction,
      untilBoundary: options?.untilBoundary ?? BoundaryType.EntireTimeline,
      loop: options?.loop ?? false,
    });

    this.playing = true;
    this.lastDatestamp = performance.now(); // TODO: Take from event.
    this.lastTimestampPromise = this.#effectiveTimestampMilliseconds();

    // TODO: Save timestamp from model?
    this.scheduler.requestAnimFrame();
  }

  pause(): void {
    this.playing = false;
    this.scheduler.cancelAnimFrame();
    this.model.playingInfo.set({
      playing: false,
      untilBoundary: BoundaryType.EntireTimeline,
    });
  }

  #animFrameEffectiveTimestampStaleDropper: StaleDropper<
    [PlayingInfo, MillisecondTimestamp, TimeRange, number, CurrentMoveInfo]
  > = new StaleDropper<
    [PlayingInfo, MillisecondTimestamp, TimeRange, number, CurrentMoveInfo]
  >();

  async animFrame(frameDatestamp: MillisecondTimestamp): Promise<void> {
    if (this.playing) {
      this.scheduler.requestAnimFrame();
    }

    const lastDatestamp = this.lastDatestamp;
    const freshenerResult =
      await this.#animFrameEffectiveTimestampStaleDropper.queue(
        Promise.all([
          this.model.playingInfo.get(),
          this.lastTimestampPromise,
          this.model.timeRange.get(),
          this.model.tempoScale.get(),
          this.model.currentMoveInfo.get(),
        ]),
      );

    const [playingInfo, lastTimestamp, timeRange, tempoScale, currentMoveInfo] =
      freshenerResult;

    // TODO: Get this without wasting time on the others?
    if (!playingInfo.playing) {
      this.playing = false;
      // TODO: Ideally we'd cancel the anim frame from the top of this method.
      // But `this.scheduler.cancelAnimFrame();` might accidentally cancel a
      // legit freshly scheduled frame. We should modify `RenderScheduler` to
      // either have individually cancellable requests, or to have something
      // like a "default" anim frame re-request that can be canceled separately.
      //
      // Note that we can't wait until here to call
      // `this.scheduler.requestAnimFrame();`, because that would slow down the
      // frame rate.
      return;
    }

    let end = currentMoveInfo.earliestEnd; // timeRange.end
    if (
      currentMoveInfo.currentMoves.length === 0 ||
      playingInfo.untilBoundary === BoundaryType.EntireTimeline
    ) {
      end = timeRange.end;
    }

    let start = currentMoveInfo.latestStart; // timeRange.end
    if (
      currentMoveInfo.currentMoves.length === 0 ||
      playingInfo.untilBoundary === BoundaryType.EntireTimeline
    ) {
      start = timeRange.start;
    }
    // const start = currentMoveInfo.latestStart; // timeRange.start // TODO

    let delta =
      (frameDatestamp - lastDatestamp) *
      directionScalar(this.direction) *
      tempoScale;
    delta = Math.max(delta, 1); // TODO: This guards against the timestamp going in the wrong direction by accident. Can we avoid it?
    delta *= playingInfo.direction;
    let newTimestamp = lastTimestamp + delta; // TODO: Pre-emptively clamp.
    let newSmartTimestampRequest: Exclude<TimestampRequest, number> | null =
      null;

    if (newTimestamp >= end) {
      if (playingInfo.loop) {
        newTimestamp = modIntoRange(
          newTimestamp,
          timeRange.start,
          timeRange.end,
        );
      } else {
        if (newTimestamp === timeRange.end) {
          newSmartTimestampRequest = "end";
        } else {
          newTimestamp = end;
        }
        this.playing = false;
        this.model.playingInfo.set({
          playing: false,
        });
      }
    } else if (newTimestamp <= start) {
      if (playingInfo.loop) {
        newTimestamp = modIntoRange(
          newTimestamp,
          timeRange.start,
          timeRange.end,
        );
      } else {
        if (newTimestamp === timeRange.start) {
          newSmartTimestampRequest = "start";
        } else {
          newTimestamp = start;
        }
        this.playing = false;
        this.model.playingInfo.set({
          playing: false,
        });
      }
    }
    this.lastDatestamp = frameDatestamp;
    this.lastTimestampPromise = Promise.resolve(newTimestamp); // TODO: Save this earlier? / Do we need to worry about the effecitve timestamp disagreeing?
    this.model.timestampRequest.set(newSmartTimestampRequest ?? newTimestamp);
  }
}
