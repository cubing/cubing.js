import type { Alg } from "../../../../alg";
import type { Timestamp } from "../../../animation/cursor/CursorTypes";
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
