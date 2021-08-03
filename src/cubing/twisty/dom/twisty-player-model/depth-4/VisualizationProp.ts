import type { VisualizationFormat } from "../../TwistyPlayerConfig";
import { Twisty2DSVG } from "../../viewers/Twisty2DSVG";
import type { PuzzleProp } from "../depth-1/PuzzleProp";
import { Twisty3DWrapper } from "../depth-2/Twisty3DWrapper";
import type { PositionProp } from "../depth-3/PositionProp";
import { ManagedSource } from "../ManagedSource";

type DerivedVisualizationFormat = "2D" | "3D"; // TODO | null;

export class VisualizationProp {
  #positionProp: ManagedSource<PositionProp>;
  #puzzleProp: ManagedSource<PuzzleProp>;

  constructor(positionProp: PositionProp, puzzleProp: PuzzleProp) {
    this.#positionProp = new ManagedSource(
      positionProp,
      this.onPosition.bind(this),
    );
    this.#puzzleProp = new ManagedSource(puzzleProp, this.onPuzzle.bind(this));
  }

  async onPosition(): Promise<void> {
    console.log("VisualizationProp.onDerivedAlg");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    const div = this.wrapperElement.appendChild(document.createElement("div"));
    div.append(` | alg = ${await this.#positionProp.target}`);
  }

  onPuzzle(): void {
    console.log("VisualizationProp.onPuzzle");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    const div = this.wrapperElement.appendChild(document.createElement("div"));
    div.append(` | puzzle = ${this.#puzzleProp.target.puzzleID}`);
  }

  #visualizationInput: VisualizationFormat = "3D"; // TODO: "preferred"?
  #cachedDerivedVisualization: DerivedVisualizationFormat | null = null; // TODO: `null` is an actual value.

  // TODO
  get derivedVisualization(): DerivedVisualizationFormat {
    return (this.#cachedDerivedVisualization ??= ["2D"].includes(
      this.#visualizationInput,
    )
      ? (this.#visualizationInput as "2D")
      : "3D");
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

  set visualization(visualizationFormat: VisualizationFormat) {
    console.log("setting!", visualizationFormat);
    const oldDerivedVisualizationInput = this.derivedVisualization;

    // TODO:
    this.#visualizationInput = visualizationFormat;
    this.#cachedDerivedVisualization = null;

    const newDerivedVisualizationInput = this.derivedVisualization;
    console.log({ oldDerivedVisualizationInput, newDerivedVisualizationInput });
    if (oldDerivedVisualizationInput !== newDerivedVisualizationInput) {
      console.log("new!");
      switch (newDerivedVisualizationInput) {
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

  get visualizationInput(): VisualizationFormat {
    return this.#visualizationInput;
  }
}
