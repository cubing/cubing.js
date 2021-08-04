import type { Alg } from "../../../alg";
import type { TimeRange } from "../../animation/cursor/AlgCursor";
import type { PuzzleID, VisualizationFormat } from "../TwistyPlayerConfig";
import { AlgIssues, AlgProp } from "./depth-1/AlgProp";
import { PuzzleProp } from "./depth-1/PuzzleProp";
import { PuzzleAlgProp } from "./depth-2/PuzzleAlgProp";
import { VisualizationStrategyProp } from "./depth-2/VisualizationStrategyProp";
import { IndexerProp } from "./depth-3/IndexerProp";
import { VisualizationProp } from "./depth-4/VisualizationProp";

export class TwistyPlayerModel {
  algProp: AlgProp;
  setupProp: AlgProp;
  puzzleProp: PuzzleProp;

  puzzleAlgProp: PuzzleAlgProp;
  visualizationStrategyProp: VisualizationStrategyProp;

  puzzleSetupProp: PuzzleAlgProp;
  indexerProp: IndexerProp;
  visualizationProp: VisualizationProp;

  constructor() {
    this.algProp = new AlgProp();
    this.setupProp = new AlgProp();
    this.puzzleProp = new PuzzleProp();
    this.puzzleAlgProp = new PuzzleAlgProp(this.algProp, this.puzzleProp);
    this.puzzleSetupProp = new PuzzleAlgProp(this.setupProp, this.puzzleProp);
    this.indexerProp = new IndexerProp(
      this.puzzleAlgProp,
      this.puzzleSetupProp,
      this.puzzleProp,
    );
    this.visualizationStrategyProp = new VisualizationStrategyProp(
      this.puzzleProp,
    );
    this.visualizationProp = new VisualizationProp(
      this.visualizationStrategyProp,
      this.indexerProp,
      this.puzzleProp,
    );
  }

  set requestedVisualization(visualization: VisualizationFormat) {
    this.visualizationStrategyProp.requestedVisualization = visualization;
  }

  get requestedVisualization(): VisualizationFormat {
    return this.visualizationStrategyProp.requestedVisualization;
  }

  get visualizationStrategy(): VisualizationFormat {
    return this.visualizationStrategyProp.visualizationStrategy;
  }

  set alg(newAlg: Alg | string) {
    this.algProp.alg = newAlg;
  }

  get alg(): Alg {
    return this.algProp.alg;
  }

  set setup(newSetup: Alg | string) {
    this.setupProp.alg = newSetup;
  }

  get setup(): Alg {
    return this.setupProp.alg;
  }

  set puzzle(puzzleID: PuzzleID) {
    this.puzzleProp.puzzleID = puzzleID;
  }

  get puzzle(): PuzzleID {
    return this.puzzleProp.puzzleID;
  }

  timeRange(): Promise<TimeRange> {
    return this.indexerProp.timeRange();
  }

  algIssues(): Promise<AlgIssues> {
    return this.puzzleAlgProp.algIssues();
  }
}
