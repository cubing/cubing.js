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
import { TimestampProp } from "./depth-1/TimestampProp";
import { PuzzleDefProp } from "./depth-2/PuzzleDefProp";
import { PuzzleAlgProp } from "./depth-3/PuzzleAlgProp";
import { AlgTransformationProp } from "./depth-4/AlgTransformationProp";
import { IndexerProp } from "./depth-4/IndexerProp";
import { PositionProp } from "./depth-5/PositionProp";
import { TimeRangeProp } from "./depth-5/TimeRangeProp";

export class TwistyPlayerModel {
  // Depth 1
  algProp: AlgProp;
  indexerConstructor: IndexerConstructorProp;
  orbitCoordinatesProp: OrbitCoordinatesProp;
  playingProp: PlayingProp;
  puzzleProp: PuzzleProp;
  setupProp: AlgProp;
  setupAnchorProp: SetupAnchorProp;
  timestampProp: TimestampProp;

  // Depth 2
  puzzleDefProp: PuzzleDefProp;

  // Depth 3
  puzzleAlgProp: PuzzleAlgProp;
  puzzleSetupProp: PuzzleAlgProp;

  // Depth 4
  indexerProp: IndexerProp;
  setupTransformationProp: AlgTransformationProp;

  // Depth 5
  positionProp: PositionProp;
  timeRangeProp: TimeRangeProp;

  // Depth 6
  // TODO: Inline Twisty3D management.

  constructor() {
    this.algProp = new AlgProp();
    this.setupProp = new AlgProp();
    this.puzzleProp = new PuzzleProp();
    this.setupAnchorProp = new SetupAnchorProp();
    this.puzzleDefProp = new PuzzleDefProp({ puzzle: this.puzzleProp });
    this.puzzleAlgProp = new PuzzleAlgProp({
      algWithIssues: this.algProp,
      puzzleDef: this.puzzleDefProp,
    });
    this.puzzleSetupProp = new PuzzleAlgProp({
      algWithIssues: this.setupProp,
      puzzleDef: this.puzzleDefProp,
    });

    this.indexerConstructor = new IndexerConstructorProp();
    this.indexerProp = new IndexerProp({
      indexerConstructor: this.indexerConstructor,
      algWithIssues: this.puzzleAlgProp,
      def: this.puzzleDefProp,
    });

    this.timestampProp = new TimestampProp();

    this.setupTransformationProp = new AlgTransformationProp({
      alg: this.puzzleSetupProp,
      def: this.puzzleDefProp,
    });

    this.positionProp = new PositionProp({
      setupTransformation: this.setupTransformationProp,
      indexer: this.indexerProp,
      timestamp: this.timestampProp,
      def: this.puzzleDefProp,
    });

    this.timeRangeProp = new TimeRangeProp({ indexer: this.indexerProp });

    this.playingProp = new PlayingProp();

    this.orbitCoordinatesProp = new OrbitCoordinatesProp();
  }

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
    this.timestampProp.set(timestamp);
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
  private lastTimestamp: Promise<MillisecondTimestamp>;

  private scheduler: RenderScheduler = new RenderScheduler(
    this.animFrame.bind(this),
  );

  constructor(model: TwistyPlayerModel) {
    this.model = model;
    this.lastTimestamp = this.model.timestampProp.get();

    this.model.playingProp.addListener(() => this.onPlayingProp); // TODO
  }

  async onPlayingProp(): Promise<void> {
    const playing = (await this.model.playingProp.get()).playing;
    if (playing !== this.playing) {
      playing ? this.play() : this.pause();
    }
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
    this.lastTimestamp = this.model.timestampProp.get();

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

    const lastTimestamp = await this.lastTimestamp!;
    const recheckTimestamp = await this.model.timestampProp.get();

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

    const newTimestamp = lastTimestamp + delta;
    // console.log({
    //   lastTimestamp,
    //   newTimestamp,
    //   frameDatestamp,
    //   lastDatestamp: this.lastDatestamp,
    // });

    this.lastDatestamp = frameDatestamp;
    this.lastTimestamp = Promise.resolve(newTimestamp); // TODO: Safe this earlier?
    // console.log("setting timestamp", newTimestamp);
    this.model.timestampProp.set(newTimestamp);
  }
}
