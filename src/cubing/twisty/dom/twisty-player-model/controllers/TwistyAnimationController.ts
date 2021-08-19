import type { TimeRange } from "../../../animation/cursor/AlgCursor";
import {
  BoundaryType,
  Direction,
  directionScalar,
  MillisecondTimestamp,
} from "../../../animation/cursor/CursorTypes";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import type { PlayingInfo } from "../props/depth-0/PlayingProp";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import { StaleDropper } from "../props/PromiseFreshener";
import type { CurrentMoveInfo } from "../../../animation/indexer/AlgIndexer";

export class TwistyAnimationController {
  // TODO: #private?
  private playing: boolean = false;
  private direction: Direction = Direction.Forwards;

  private model: TwistyPlayerModel;

  private lastDatestamp: MillisecondTimestamp = 0;
  private lastTimestampPromise: Promise<MillisecondTimestamp>;

  private scheduler: RenderScheduler = new RenderScheduler(
    this.animFrame.bind(this),
  );

  constructor(model: TwistyPlayerModel) {
    this.model = model;
    this.lastTimestampPromise = this.#effectiveTimestampMilliseconds();

    this.model.playingProp.addFreshListener(this.onPlayingProp.bind(this)); // TODO
  }

  async onPlayingProp(playingInfo: PlayingInfo): Promise<void> {
    if (playingInfo.playing !== this.playing) {
      playingInfo.playing ? this.play() : this.pause();
    }
  }

  async #effectiveTimestampMilliseconds(): Promise<MillisecondTimestamp> {
    return (await this.model.detailedTimelineInfoProp.get()).timestamp;
  }

  // TODO: Return the animation we've switched to.
  jumpToStart(): void {
    this.model.timestampRequestProp.set("start");
    this.pause();
  }

  // TODO: Return the animation we've switched to.
  jumpToEnd(): void {
    this.model.timestampRequestProp.set("end");
    this.pause();
  }

  // TODO: Return the animation we've switched to.
  playPause(): { direction: Direction; playing: boolean } {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
    return { direction: this.direction, playing: this.playing };
  }

  // TODO: bundle playing direction, and boundary into `toggle`.
  async play(
    untilBoundary: BoundaryType = BoundaryType.EntireTimeline,
  ): Promise<void> {
    if (this.playing) {
      return;
    }

    if ((await this.model.detailedTimelineInfoProp.get()).atEnd) {
      this.model.timestampRequestProp.set("start");
    }
    this.model.playingProp.set({
      playing: true,
      untilBoundary,
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
    this.model.playingProp.set({
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
          this.model.playingProp.get(),
          this.lastTimestampPromise,
          this.model.timeRangeProp.get(),
          this.model.tempoScaleProp.get(),
          this.model.currentLeavesProp.get(),
        ]),
      );

    const [playingInfo, lastTimestamp, timeRange, tempoScale, currentMoveInfo] =
      freshenerResult;

    // TODO: Get this without wasting time on the others?
    if (playingInfo.playing === false) {
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
    // const start = currentMoveInfo.latestStart; // timeRange.start // TODO

    let delta =
      (frameDatestamp - lastDatestamp) *
      directionScalar(this.direction) *
      tempoScale;
    delta = Math.max(delta, 1); // TODO: This guards against the timestamp going backwards by accident. Can we avoid it?
    let newTimestamp = lastTimestamp + delta; // TODO: Pre-emptively clamp.

    if (newTimestamp >= end) {
      newTimestamp = end;
      this.model.timestampRequestProp.set("end");
      this.playing = false;
      this.model.playingProp.set({
        playing: false,
        untilBoundary: BoundaryType.EntireTimeline,
      });
    }
    this.lastDatestamp = frameDatestamp;
    this.lastTimestampPromise = Promise.resolve(newTimestamp); // TODO: Save this earlier? / Do we need to worry about the effecitve timestamp disagreeing?
    this.model.timestampRequestProp.set(newTimestamp);
  }
}
