import type { Alg } from "../../../../alg";
import {
  Direction,
  directionScalar,
  MillisecondTimestamp,
  Timestamp,
} from "../../../animation/cursor/CursorTypes";
import { RenderScheduler } from "../../../animation/RenderScheduler";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { AlgProp } from "./depth-1/AlgProp";
import { IndexerConstructorProp } from "./depth-1/IndexerConstructorProp";
import { PuzzleProp } from "./depth-1/PuzzleProp";
import { TimestampProp } from "./depth-1/TimestampProp";
import { PuzzleDefProp } from "./depth-2/PuzzleDefProp";
import { PuzzleAlgProp } from "./depth-3/PuzzleAlgProp";
import { AlgTransformationProp } from "./depth-4/AlgTransformationProp";
import { IndexerProp } from "./depth-4/IndexerProp";
import { PositionProp } from "./depth-5/PositionProp";
import { TimeRangeProp } from "./depth-5/TimeRangeProp";

export class TwistyPlayerModel {
  algProp: AlgProp;
  setupProp: AlgProp;
  puzzleProp: PuzzleProp;
  puzzleDefProp: PuzzleDefProp;
  puzzleAlgProp: PuzzleAlgProp;
  puzzleSetupProp: PuzzleAlgProp;
  indexerConstructor: IndexerConstructorProp;
  indexerProp: IndexerProp;
  timestampProp: TimestampProp;
  setupTransformationProp: AlgTransformationProp;
  positionProp: PositionProp;
  timeRangeProp: TimeRangeProp;

  playController: PlayController; // TODO: #private?

  constructor() {
    this.algProp = new AlgProp();
    this.setupProp = new AlgProp();
    this.puzzleProp = new PuzzleProp();
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

    this.playController = new PlayController(this);
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

  set timestamp(timestamp: Timestamp) {
    this.timestampProp.set(timestamp);
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
  }

  play(): void {
    if (this.playing) {
      return;
    }

    this.playing = true;
    this.lastDatestamp = performance.now(); // TODO: Take from event.
    this.lastTimestamp = this.model.timestampProp.get();

    // TODO: Save timestamp from model?

    this.scheduler.requestAnimFrame();
  }

  pause(): void {
    this.playing = false;
    this.scheduler.cancelAnimFrame();
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
