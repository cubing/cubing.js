import type { Alg } from "../../../../alg";
import {
  Direction,
  directionScalar,
  MillisecondTimestamp,
} from "../../../animation/cursor/CursorTypes";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { AlgProp } from "./depth-1/AlgProp";
import { IndexerConstructorProp } from "./depth-1/IndexerConstructorProp";
import { OrbitCoordinatesProp } from "./depth-1/OrbitCoordinatesProp";
import { PlayingProp } from "./depth-1/PlayingProp";
import { PuzzleProp } from "./depth-1/PuzzleProp";
import { SetupAnchorProp } from "./depth-1/SetupAnchorProp";
import { TimestampRequestProp } from "./depth-1/TimestampRequestProp";
import { PuzzleDefProp } from "./depth-2/PuzzleDefProp";
import { PuzzleAlgProp } from "./depth-3/PuzzleAlgProp";
import { AlgTransformationProp } from "./depth-4/AlgTransformationProp";
import { IndexerProp } from "./depth-4/IndexerProp";
import { AnchoredStartProp } from "./depth-5/AnchoredStartProp";
import { TimeRangeProp } from "./depth-5/TimeRangeProp";
import { EffectiveTimestampProp } from "./depth-6/EffectiveTimestamp";
import { ButtonAppearanceProp } from "./depth-7/ButtonAppearanceProp";
import { PositionProp } from "./depth-7/PositionProp";

export class TwistyPlayerModel {
  // Depth 1
  algProp: AlgProp = new AlgProp();
  indexerConstructor: IndexerConstructorProp = new IndexerConstructorProp();
  orbitCoordinatesProp: OrbitCoordinatesProp = new OrbitCoordinatesProp();
  playingProp: PlayingProp = new PlayingProp();
  puzzleProp: PuzzleProp = new PuzzleProp();
  setupAnchorProp: SetupAnchorProp = new SetupAnchorProp();
  setupProp: AlgProp = new AlgProp();
  timestampRequestProp: TimestampRequestProp = new TimestampRequestProp();
  // back-view // TODO
  // background // TODO
  // control-panel // TODO
  // hint-facelets // TODO
  // stickering // TODO
  // visualization // TODO

  // Depth 2
  puzzleDefProp: PuzzleDefProp = new PuzzleDefProp({ puzzle: this.puzzleProp });

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
  effectiveTimestampProp: EffectiveTimestampProp = new EffectiveTimestampProp({
    timestampRequest: this.timestampRequestProp,
    timeRange: this.timeRangeProp,
    setupAnchor: this.setupAnchorProp,
  });

  // Depth 7
  buttonAppearanceProp: ButtonAppearanceProp = new ButtonAppearanceProp({
    effectiveTimestamp: this.effectiveTimestampProp,
    playing: this.playingProp,
  });

  positionProp: PositionProp = new PositionProp({
    anchoredStart: this.anchoredStartProp,
    indexer: this.indexerProp,
    effectiveTimestamp: this.effectiveTimestampProp,
    def: this.puzzleDefProp,
  });

  // Depth 8
  // TODO: Inline Twisty3D management.

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
}

export class TwistyPlayerController {
  playController: PlayController;

  constructor(model: TwistyPlayerModel) {
    this.playController = new PlayController(model);
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

    this.model.playingProp.addListener(() => this.onPlayingProp); // TODO
  }

  async onPlayingProp(): Promise<void> {
    const playing = (await this.model.playingProp.get()).playing;
    if (playing !== this.playing) {
      playing ? this.play() : this.pause();
    }
  }

  async #effectiveTimestampMilliseconds(): Promise<MillisecondTimestamp> {
    return (await this.model.effectiveTimestampProp.get()).timestamp;
  }

  // TODO: Return the animation we've switched to.
  jumpToStart(): void {
    this.model.timestampRequestProp.set("start");
  }

  // TODO: Return the animation we've switched to.
  jumpToEnd(): void {
    this.model.timestampRequestProp.set("end");
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

  play(): void {
    if (this.playing) {
      return;
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

  async animFrame(frameDatestamp: MillisecondTimestamp): Promise<void> {
    if (!this.playing) {
      return;
    }

    // console.log({ frameDatestamp });

    this.scheduler.requestAnimFrame();
    const delta =
      (frameDatestamp - this.lastDatestamp) * directionScalar(this.direction);

    const lastTimestamp = await this.lastTimestampPromise;
    const recheckTimestamp = await this.#effectiveTimestampMilliseconds();

    if (recheckTimestamp !== lastTimestamp) {
      console.log(
        new Error(
          "Looks like something updated the timestamp outside the animation!",
        ),
      );
      this.pause();
      this.model.playingProp.set({ playing: false });
      // TODO: Listen for timestamp updates not caused by us, so that the anim frame is never run.
      // That would turn this code path into an error case.
      return;
    }

    // TODO: Don't animate past end.

    const newTimestamp = lastTimestamp + delta; // TODO: Pre-emptively clamp.
    // console.log({
    //   lastTimestamp,
    //   newTimestamp,
    //   frameDatestamp,
    //   lastDatestamp: this.lastDatestamp,
    // });

    this.lastDatestamp = frameDatestamp;
    this.lastTimestampPromise = Promise.resolve(newTimestamp); // TODO: Save this earlier? / Do we need to worry about the effecitve timestamp disagreeing?
    // console.log("setting timestamp", newTimestamp);
    this.model.timestampRequestProp.set(newTimestamp);
  }
}
