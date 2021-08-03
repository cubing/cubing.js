import { Twisty2DSVG } from "../../viewers/Twisty2DSVG";
import type { PuzzleProp } from "../depth-1/PuzzleProp";
import { Twisty3DWrapper } from "../depth-2/Twisty3DWrapper";
import type { VisualizationStrategyProp } from "../depth-2/VisualizationStrategyProp";
import type { PositionProp } from "../depth-3/PositionProp";
import { ManagedSource } from "../ManagedSource";

export class VisualizationProp {
  #visualizationStrategyProp: ManagedSource<VisualizationStrategyProp>;
  #positionProp: ManagedSource<PositionProp>;
  #puzzleProp: ManagedSource<PuzzleProp>;

  constructor(
    visualizationStrategyProp: VisualizationStrategyProp,
    positionProp: PositionProp,
    puzzleProp: PuzzleProp,
  ) {
    this.#visualizationStrategyProp = new ManagedSource(
      visualizationStrategyProp,
      this.#onVisualizationStrategy.bind(this),
    );
    this.#positionProp = new ManagedSource(
      positionProp,
      this.onPosition.bind(this),
    );
    this.#puzzleProp = new ManagedSource(puzzleProp, this.onPuzzle.bind(this));

    this.#onVisualizationStrategy(); // TODO: Can we do this better in general?
  }

  async onPosition(): Promise<void> {
    console.log("VisualizationProp.onDerivedAlg");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    // const div = this.wrapperElement.appendChild(document.createElement("div"));
    const twisty3D = await (this.element as Twisty3DWrapper).twisty3D();
    console.log(
      twisty3D.onPositionChange({
        state: await this.#positionProp.target.startState(),
        movesInProgress: [],
      }),
    );
  }

  onPuzzle(): void {
    console.log("VisualizationProp.onPuzzle");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    const div = this.wrapperElement.appendChild(document.createElement("div"));
    div.append(` | puzzle = ${this.#puzzleProp.target.puzzleID}`);
  }

  // TODO: Make a direct class instead of this.
  #wrapperElement: HTMLDivElement = document.createElement("div");
  get wrapperElement(): HTMLElement {
    return this.#wrapperElement;
  }

  #element: HTMLElement | null = null;
  set element(newElement: HTMLElement | null) {
    // Clear
    this.#element?.remove();
    this.#element = null;
    // TODO: Propagate / unregister self?

    // Set
    this.#element = newElement;
    if (this.#element !== null) {
      this.#wrapperElement.appendChild(this.#element);
    }
  }

  get element(): HTMLElement | null {
    return this.#element;
  }

  #onVisualizationStrategy() {
    const strategy =
      this.#visualizationStrategyProp.target.visualizationStrategy;
    switch (strategy) {
      case "2D":
        console.log("2D!");
        this.element = new Twisty2DSVG();
        break;
      case "3D":
        console.log("3D!");
        this.element = new Twisty3DWrapper(this.#puzzleProp.target);
        break;
    }
  }
}
