import type { Alg } from "../../../alg";
import type { PuzzleLoader } from "../../../puzzles";
import type { PuzzleID } from "../TwistyPlayerConfig";
import { AlgIssues, AlgProp } from "./depth-1/AlgProp";
import { PuzzleProp } from "./depth-1/PuzzleProp";
import { DerivedAlgProp } from "./depth-2/DerivedAlgProp";
import { VisualizationProp } from "./depth-3/VisualizationProp";

export class TwistyPlayerModel {
  algProp: AlgProp;
  puzzleProp: PuzzleProp;
  displayAlgProp: DerivedAlgProp;
  visualizationProp: VisualizationProp;

  constructor() {
    this.algProp = new AlgProp();
    this.puzzleProp = new PuzzleProp();
    this.displayAlgProp = new DerivedAlgProp(this.algProp, this.puzzleProp);
    this.visualizationProp = new VisualizationProp(
      this.displayAlgProp,
      this.puzzleProp,
    );
  }

  set alg(newAlg: Alg | string) {
    this.algProp.alg = newAlg;
  }

  get alg(): Alg {
    return this.algProp.alg;
  }

  set puzzle(puzzleID: PuzzleID) {
    this.puzzleProp.puzzleID = puzzleID;
  }

  get puzzle(): PuzzleID {
    return this.puzzleProp.puzzleID;
  }

  get puzzleLoader(): PuzzleLoader {
    return this.puzzleProp.puzzleLoader;
  }

  algIssues(): Promise<AlgIssues> {
    return this.displayAlgProp.algIssues();
  }
}
