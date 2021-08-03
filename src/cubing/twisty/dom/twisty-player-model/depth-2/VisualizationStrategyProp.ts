import type { VisualizationFormat } from "../../TwistyPlayerConfig";
import type { PuzzleProp } from "../depth-1/PuzzleProp";
import { ManagedSource } from "../ManagedSource";
import { TwistyProp } from "../TwistyProp";

type VisualizationStrategy = "2D" | "3D"; // TODO | null;

export class VisualizationStrategyProp extends TwistyProp {
  #puzzleProp: ManagedSource<PuzzleProp>;

  constructor(puzzleProp: PuzzleProp) {
    super();
    this.#puzzleProp = new ManagedSource(puzzleProp, this.onPuzzle.bind(this));
  }

  onPuzzle(): void {
    // TODO: Support override per puzzle.
    console.log(
      "VisualizationStrategyProp.onPuzzle",
      this.#puzzleProp.target.puzzleID,
    );
  }

  #requestedVisualization: VisualizationFormat = "3D"; // TODO: "preferred"?
  set requestedVisualization(visualizationFormat: VisualizationFormat) {
    console.log("setting!", visualizationFormat);
    const oldVisualizationStrategy = this.visualizationStrategy;

    // TODO:
    this.#requestedVisualization = visualizationFormat;
    this.#cachedVisualizationStrategy = null;

    const newVisualizationStrategy = this.visualizationStrategy;
    console.log({
      oldVisualizationStrategy,
      newDerivedVisualizationInput: newVisualizationStrategy,
    });
    if (oldVisualizationStrategy !== newVisualizationStrategy) {
      this.dispatch();
    }
  }

  get requestedVisualization(): VisualizationFormat {
    return this.#requestedVisualization;
  }

  #cachedVisualizationStrategy: VisualizationStrategy | null = null; // TODO: `null` is an actual value.
  get visualizationStrategy(): VisualizationStrategy {
    return (this.#cachedVisualizationStrategy ??= ["2D"].includes(
      this.#requestedVisualization,
    )
      ? (this.#requestedVisualization as "2D")
      : "3D");
  }
}
