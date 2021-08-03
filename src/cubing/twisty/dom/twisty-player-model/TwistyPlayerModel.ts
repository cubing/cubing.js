import type { Alg } from "../../../alg";
import type { PuzzleID, VisualizationFormat } from "../TwistyPlayerConfig";
import { AlgIssues, AlgProp } from "./depth-1/AlgProp";
import { PuzzleProp } from "./depth-1/PuzzleProp";
import { PuzzleAlgProp } from "./depth-2/PuzzleAlgProp";
import type { VisualizationStrategyProp } from "./depth-2/VisualizationStrategyProp";
import { PositionProp } from "./depth-3/PositionProp";
import { VisualizationProp } from "./depth-4/VisualizationProp";

export class TwistyPlayerModel {
  algProp: AlgProp;
  setupProp: AlgProp;
  puzzleProp: PuzzleProp;

  puzzleAlgProp: PuzzleAlgProp;
  visualizationStrategyProp: VisualizationStrategyProp;

  puzzleSetupProp: PuzzleAlgProp;
  positionProp: PositionProp;
  visualizationProp: VisualizationProp;

  constructor() {
    this.algProp = new AlgProp();
    this.setupProp = new AlgProp();
    this.puzzleProp = new PuzzleProp();
    this.puzzleAlgProp = new PuzzleAlgProp(this.algProp, this.puzzleProp);
    this.puzzleSetupProp = new PuzzleAlgProp(this.setupProp, this.puzzleProp);
    this.positionProp = new PositionProp(
      this.puzzleAlgProp,
      this.puzzleSetupProp,
      this.puzzleProp,
    );
    this.visualizationProp = new VisualizationProp(
      this.positionProp,
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

  set visualization(newVisualization: VisualizationFormat) {
    this.visualizationProp.visualization = newVisualization;
  }

  algIssues(): Promise<AlgIssues> {
    return this.puzzleAlgProp.algIssues();
  }
}
