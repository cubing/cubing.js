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
import { AlgProp } from "./depth-0/AlgProp";
import { BackgroundProp } from "./depth-0/BackgroundProp";
import { BackViewProp } from "./depth-0/BackViewProp";
import { HintFaceletProp } from "./depth-0/HintFaceletProp";
import { IndexerConstructorRequestProp } from "./depth-0/IndexerConstructorRequestProp";
import { OrbitCoordinatesProp } from "./depth-1/OrbitCoordinatesProp";
import { PlayingInfo, PlayingProp } from "./depth-0/PlayingProp";
import { PuzzleProp } from "./depth-0/PuzzleProp";
import { SetupAnchorProp } from "./depth-0/SetupAnchorProp";
import { StickeringProp } from "./depth-0/StickeringProp";
import { TimestampRequestProp } from "./depth-0/TimestampRequestProp";
import { PuzzleDefProp } from "./depth-1/PuzzleDefProp";
import { PuzzleAlgProp } from "./depth-2/PuzzleAlgProp";
import { AlgTransformationProp } from "./depth-3/AlgTransformationProp";
import { IndexerProp } from "./depth-3/IndexerProp";
import { AnchoredStartProp } from "./depth-4/AnchoredStartProp";
import { TimeRangeProp } from "./depth-4/TimeRangeProp";
import { DetailedTimelineInfoProp } from "./depth-5/DetailedTimelineInfoProp";
import { CoarseTimelineInfoProp } from "./depth-6/CoarseTimelineInfoProp";
import { PositionProp } from "./depth-6/PositionProp";
import { ButtonAppearanceProp } from "./depth-7/ButtonAppearanceProp";
import { OrbitCoordinatesRequestProp } from "./depth-0/OrbitCoordinatesRequestProp";
import { LatitudeLimitProp } from "./depth-0/LatitudeLimit";
import { ControlPanelProp } from "./depth-0/ControlPanelProp";
import { VisualizationFormatProp } from "./depth-0/VisualizationProp";
import { EffectiveVisualizationFormatProp } from "./depth-1/EffectiveVisualizationFormatProp";
import { ViewerLinkProp } from "./depth-0/ViewerLinkProp";
import { IndexerConstructorProp } from "./depth-2/IndexerConstructorProp";

export class TwistyPlayerModel {
  // TODO: Redistribute and group props with controllers.

  // Depth 0
  algProp = new AlgProp();
  backgroundProp = new BackgroundProp();
  backViewProp = new BackViewProp();
  controlPanelProp = new ControlPanelProp();
  hintFaceletProp = new HintFaceletProp();
  indexerConstructorRequestProp = new IndexerConstructorRequestProp();

  latitudeLimitProp = new LatitudeLimitProp();
  orbitCoordinatesRequestProp: OrbitCoordinatesRequestProp =
    new OrbitCoordinatesRequestProp();

  playingProp = new PlayingProp();
  puzzleProp = new PuzzleProp();
  setupAnchorProp = new SetupAnchorProp();
  setupProp = new AlgProp();
  stickeringProp = new StickeringProp();
  timestampRequestProp = new TimestampRequestProp();
  viewerLinkProp = new ViewerLinkProp();
  visualizationFormatProp = new VisualizationFormatProp();

  // Depth 1
  effectiveVisualizationFormatProp = new EffectiveVisualizationFormatProp({
    visualizationRequest: this.visualizationFormatProp,
    puzzleID: this.puzzleProp,
  });

  orbitCoordinatesProp = new OrbitCoordinatesProp({
    orbitCoordinatesRequest: this.orbitCoordinatesRequestProp,
    latitudeLimit: this.latitudeLimitProp,
  });

  puzzleDefProp = new PuzzleDefProp({ puzzle: this.puzzleProp });

  // Depth 2
  indexerConstructorProp = new IndexerConstructorProp({
    alg: this.algProp,
    puzzle: this.puzzleProp,
    effectiveVisualization: this.effectiveVisualizationFormatProp,
    indexerConstructorRequest: this.indexerConstructorRequestProp,
  });

  puzzleAlgProp = new PuzzleAlgProp({
    algWithIssues: this.algProp,
    puzzleDef: this.puzzleDefProp,
  });

  puzzleSetupProp = new PuzzleAlgProp({
    algWithIssues: this.setupProp,
    puzzleDef: this.puzzleDefProp,
  });

  // Depth 3
  indexerProp = new IndexerProp({
    indexerConstructor: this.indexerConstructorProp,
    algWithIssues: this.puzzleAlgProp,
    def: this.puzzleDefProp,
  });

  setupTransformationProp = new AlgTransformationProp({
    alg: this.puzzleSetupProp,
    def: this.puzzleDefProp,
  });

  // Depth 4
  anchoredStartProp = new AnchoredStartProp({
    setupAnchor: this.setupAnchorProp,
    setupTransformation: this.setupTransformationProp,
    indexer: this.indexerProp,
    def: this.puzzleDefProp,
  });

  timeRangeProp = new TimeRangeProp({
    indexer: this.indexerProp,
  });

  // Depth 5
  detailedTimelineInfoProp: DetailedTimelineInfoProp =
    new DetailedTimelineInfoProp({
      timestampRequest: this.timestampRequestProp,
      timeRange: this.timeRangeProp,
      setupAnchor: this.setupAnchorProp,
    });

  // Depth 6
  positionProp = new PositionProp({
    anchoredStart: this.anchoredStartProp,
    indexer: this.indexerProp,
    detailedTimelineInfo: this.detailedTimelineInfoProp,
    def: this.puzzleDefProp,
  });

  coarseTimelineInfoProp = new CoarseTimelineInfoProp({
    detailedTimelineInfo: this.detailedTimelineInfoProp,
    playingInfo: this.playingProp,
  });

  // Depth 7
  // TODO: Inline Twisty3D management.
  buttonAppearanceProp = new ButtonAppearanceProp({
    coarseTimelineInfo: this.coarseTimelineInfoProp,
    viewerLink: this.viewerLinkProp,
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
