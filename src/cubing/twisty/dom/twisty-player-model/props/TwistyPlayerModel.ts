import type { Alg } from "../../../../alg";
import type { TimeRange } from "../../../animation/cursor/AlgCursor";
import {
  Direction,
  directionScalar,
  MillisecondTimestamp,
} from "../../../animation/cursor/CursorTypes";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { StaleDropper } from "../controllers/PromiseFreshener";
import { AlgProp } from "./depth-1/AlgProp";
import { BackgroundProp } from "./depth-1/BackgroundProp";
import { BackViewProp } from "./depth-1/BackViewProp";
import { HintFaceletProp } from "./depth-1/HintFaceletProp";
import { IndexerConstructorProp } from "./depth-1/IndexerConstructorProp";
import { OrbitCoordinatesProp } from "./depth-2/OrbitCoordinatesProp";
import { PlayingInfo, PlayingProp } from "./depth-1/PlayingProp";
import { PuzzleProp } from "./depth-1/PuzzleProp";
import { SetupAnchorProp } from "./depth-1/SetupAnchorProp";
import { StickeringProp } from "./depth-1/StickeringProp";
import { TimestampRequestProp } from "./depth-1/TimestampRequestProp";
import { PuzzleDefProp } from "./depth-2/PuzzleDefProp";
import { PuzzleAlgProp } from "./depth-3/PuzzleAlgProp";
import { AlgTransformationProp } from "./depth-4/AlgTransformationProp";
import { IndexerProp } from "./depth-4/IndexerProp";
import { AnchoredStartProp } from "./depth-5/AnchoredStartProp";
import { TimeRangeProp } from "./depth-5/TimeRangeProp";
import { DetailedTimelineInfoProp } from "./depth-6/DetailedTimelineInfoProp";
import { CoarseTimelineInfoProp } from "./depth-7/CoarseTimelineInfoProp";
import { PositionProp } from "./depth-7/PositionProp";
import { ButtonAppearanceProp } from "./depth-8/ButtonAppearanceProp";
import { OrbitCoordinatesRequestProp } from "./depth-1/OrbitCoordinatesRequestProp";
import { LatitudeLimitProp } from "./depth-1/LatitudeLimit";

export class TwistyPlayerModel {
  // Depth 1
  algProp: AlgProp = new AlgProp();
  backgroundProp: BackgroundProp = new BackgroundProp();
  backViewProp: BackViewProp = new BackViewProp();
  hintFaceletProp: HintFaceletProp = new HintFaceletProp();
  indexerConstructor: IndexerConstructorProp = new IndexerConstructorProp();
  latitudeLimitProp: LatitudeLimitProp = new LatitudeLimitProp();
  orbitCoordinatesRequestProp: OrbitCoordinatesRequestProp =
    new OrbitCoordinatesRequestProp();

  playingProp: PlayingProp = new PlayingProp();
  puzzleProp: PuzzleProp = new PuzzleProp();
  setupAnchorProp: SetupAnchorProp = new SetupAnchorProp();
  setupProp: AlgProp = new AlgProp();
  stickeringProp: StickeringProp = new StickeringProp();
  timestampRequestProp: TimestampRequestProp = new TimestampRequestProp();
  // control-panel // TODO
  // visualization // TODO

  // Depth 2
  puzzleDefProp: PuzzleDefProp = new PuzzleDefProp({ puzzle: this.puzzleProp });
  orbitCoordinatesProp: OrbitCoordinatesProp = new OrbitCoordinatesProp({
    orbitCoordinatesRequest: this.orbitCoordinatesRequestProp,
    latitudeLimit: this.latitudeLimitProp,
  });

  // Depth 3
  puzzleAlgProp: PuzzleAlgProp = new PuzzleAlgProp({
    algWithIssues: this.algProp,
    puzzleDef: this.puzzleDefProp,
  });

  puzzleSetupProp: PuzzleAlgProp = new PuzzleAlgProp({
    algWithIssues: this.setupProp,
    puzzleDef: this.puzzleDefProp,
  });

  // Depth 4
  indexerProp: IndexerProp = new IndexerProp({
    indexerConstructor: this.indexerConstructor,
    algWithIssues: this.puzzleAlgProp,
    def: this.puzzleDefProp,
  });

  setupTransformationProp: AlgTransformationProp = new AlgTransformationProp({
    alg: this.puzzleSetupProp,
    def: this.puzzleDefProp,
  });

  // Depth 5
  anchoredStartProp: AnchoredStartProp = new AnchoredStartProp({
    setupAnchor: this.setupAnchorProp,
    setupTransformation: this.setupTransformationProp,
    indexer: this.indexerProp,
    def: this.puzzleDefProp,
  });

  timeRangeProp: TimeRangeProp = new TimeRangeProp({
    indexer: this.indexerProp,
  });

  // Depth 6
  detailedTimelineInfoProp: DetailedTimelineInfoProp =
    new DetailedTimelineInfoProp({
      timestampRequest: this.timestampRequestProp,
      timeRange: this.timeRangeProp,
      setupAnchor: this.setupAnchorProp,
    });

  // Depth 7
  positionProp: PositionProp = new PositionProp({
    anchoredStart: this.anchoredStartProp,
    indexer: this.indexerProp,
    detailedTimelineInfo: this.detailedTimelineInfoProp,
    def: this.puzzleDefProp,
  });

  coarseTimelineInfoProp: CoarseTimelineInfoProp = new CoarseTimelineInfoProp({
    detailedTimelineInfo: this.detailedTimelineInfoProp,
    playingInfo: this.playingProp,
  });

  // Depth 8
  // TODO: Inline Twisty3D management.
  buttonAppearanceProp: ButtonAppearanceProp = new ButtonAppearanceProp({
    coarseTimelineInfo: this.coarseTimelineInfoProp,
  });

  set alg(newAlg: Alg | string) {
    this.algProp.set(newAlg);
  }

  set setup(newSetup: Alg | string) {
    this.setupProp.set(newSetup);
  }

  set puzzle(puzzleID: PuzzleID) {
    this.puzzleProp.set(puzzleID);
  }

  set timestamp(timestamp: MillisecondTimestamp) {
    this.timestampRequestProp.set(timestamp);
  }

  public async twizzleLink(): Promise<string> {
    const url = new URL("https://alpha.twizzle.net/edit/");

    const [puzzle, alg, setup, anchor] = await Promise.all([
      this.puzzleProp.get(),
      this.algProp.get(),
      this.setupProp.get(),
      this.setupAnchorProp.get(),
    ]);

    if (!alg.alg.experimentalIsEmpty()) {
      url.searchParams.set("alg", alg.alg.toString());
    }
    if (!setup.alg.experimentalIsEmpty()) {
      url.searchParams.set("experimental-setup-alg", setup.toString());
    }
    if (anchor !== "start") {
      url.searchParams.set("experimental-setup-anchor", anchor);
    }
    // if (this.experimentalStickering !== "full") {
    //   url.searchParams.set(
    //     "experimental-stickering",
    //     this.experimentalStickering,
    //   );
    if (puzzle !== "3x3x3") {
      url.searchParams.set("puzzle", puzzle);
    }
    return url.toString();
  }
}

export class TwistyPlayerController {
  playController: PlayController;

  constructor(private model: TwistyPlayerModel) {
    this.playController = new PlayController(model);
  }

  jumpToStart(): void {
    this.playController.jumpToStart();
  }

  jumpToEnd(): void {
    this.playController.jumpToEnd();
  }

  play(): void {
    this.playController.play();
  }

  pause(): void {
    this.playController.pause();
  }

  playPause(): { direction: Direction; playing: boolean } {
    return this.playController.playPause();
  }

  public async visitTwizzleLink(): Promise<void> {
    const a = document.createElement("a");
    a.href = await this.model.twizzleLink();
    a.target = "_blank";
    a.click();
  }
}

class PlayController {
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

  async play(): Promise<void> {
    if (this.playing) {
      return;
    }

    if ((await this.model.detailedTimelineInfoProp.get()).atEnd) {
      this.model.timestampRequestProp.set("start");
    }
    this.model.playingProp.set({ playing: true });

    this.playing = true;
    this.lastDatestamp = performance.now(); // TODO: Take from event.
    this.lastTimestampPromise = this.#effectiveTimestampMilliseconds();

    // TODO: Save timestamp from model?

    this.scheduler.requestAnimFrame();
  }

  pause(): void {
    this.playing = false;
    this.scheduler.cancelAnimFrame();
    this.model.playingProp.set({ playing: false });
  }

  #animFrameEffectiveTimestampStaleDropper: StaleDropper<
    [{ playing: boolean }, MillisecondTimestamp, TimeRange]
  > = new StaleDropper<
    [{ playing: boolean }, MillisecondTimestamp, TimeRange]
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
        ]),
      );

    const [playing, lastTimestamp, timeRange] = freshenerResult;

    // TODO: Get this without wasting time on the others?
    if (playing.playing === false) {
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

    const delta =
      (frameDatestamp - lastDatestamp) * directionScalar(this.direction);
    let newTimestamp = lastTimestamp + delta; // TODO: Pre-emptively clamp.
    if (newTimestamp >= timeRange.end) {
      newTimestamp = timeRange.end;
      this.model.timestampRequestProp.set("end");
      this.playing = false;
      this.model.playingProp.set({ playing: false });
    }
    this.lastDatestamp = frameDatestamp;
    this.lastTimestampPromise = Promise.resolve(newTimestamp); // TODO: Save this earlier? / Do we need to worry about the effecitve timestamp disagreeing?
    this.model.timestampRequestProp.set(newTimestamp);
  }
}
