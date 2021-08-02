import type { VisualizationFormat } from "../../../../../dist/types/twisty/dom/TwistyPlayerConfig";
import { PuzzleLoader, puzzles } from "../../..//puzzles";
import type { Alg } from "../../../alg";
import { KPuzzle } from "../../../kpuzzle";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { customElementsShim } from "../element/node-custom-element-shims";
import type { PuzzleID } from "../TwistyPlayerConfig";
import { Twisty2DSVG } from "../viewers/Twisty2DSVG";
import { AlgIssues, AlgProp } from "./AlgProp";
import { ManagedSource } from "./ManagedSource";

class PuzzleProp extends EventTarget {
  #puzzleID: PuzzleID = "3x3x3";

  constructor() {
    super();
  }

  set puzzleID(newPuzzleID: PuzzleID) {
    // TODO: is this the right way?
    if (this.#puzzleID !== newPuzzleID) {
      this.#puzzleID = newPuzzleID;
      this.dispatchEvent(new CustomEvent("update"));
    }
  }

  get puzzleID(): PuzzleID {
    return this.#puzzleID;
  }

  get puzzleLoader(): PuzzleLoader {
    return puzzles[this.#puzzleID];
  }
}

class DisplayAlgProp extends EventTarget {
  algSource: ManagedSource<AlgProp>;
  #algIssues: Promise<AlgIssues> | null = null;
  puzzleSource: ManagedSource<PuzzleProp>;

  constructor(algProp: AlgProp, puzzleProp: PuzzleProp) {
    super();
    this.algSource = new ManagedSource<AlgProp>(algProp, this.onAlg.bind(this));
    this.puzzleSource = new ManagedSource<PuzzleProp>(
      puzzleProp,
      this.onPuzzle.bind(this),
    );
  }

  onAlg() {
    // console.log("onAlg");
    this.#algIssues = null;
  }

  onPuzzle() {
    // console.log("onPuzzle");
    this.#algIssues = null;
  }

  algIssues(): Promise<AlgIssues> {
    // TODO: handle string sources to compare caononicalization.
    return (this.#algIssues ||= (async () => {
      const algIssues = this.algSource.target.algIssues.clone();
      // console.log("dfdf", this.algSource.target.algIssues === algIssues);
      try {
        const alg = this.algSource.target.alg; // TODO: Can we get a frozen reference before doing anything async?
        const def = await this.puzzleSource.target.puzzleLoader.def();
        const kpuzzle = new KPuzzle(def);
        kpuzzle.applyAlg(alg);
      } catch (e) {
        algIssues.errors.push(`Invalid alg for puzzle: ${e}`);
      }
      return algIssues;
    })());
  }
}

class Twisty3DWrapper extends ManagedCustomElement {
  connectedCallback() {
    console.log("connected!");
    this.contentWrapper.textContent = "wrapper!";
  }
}
customElementsShim.define("twisty-3d-wrapper", Twisty3DWrapper);

type DerivedVisualizationFormat = "2D" | "3D" | null;

class VisualizationProp {
  #visualizationInput: VisualizationFormat | null = null;
  #cachedDerivedVisualization: DerivedVisualizationFormat = null;

  private get derivedVisualization(): DerivedVisualizationFormat {
    return (this.#cachedDerivedVisualization ||= ["2D", null].includes(
      this.#visualizationInput,
    )
      ? (this.#visualizationInput as "2D" | null)
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

  set visualization(visualizationFormat: VisualizationFormat) {
    console.log("setting!");
    const oldDerivedVisualizationInput = this.derivedVisualization;
    this.#visualizationInput = visualizationFormat;
    const newDerivedVisualizationInput = this.derivedVisualization;
    if (oldDerivedVisualizationInput !== newDerivedVisualizationInput) {
      console.log("new!");
      switch (newDerivedVisualizationInput) {
        case "2D":
          this.element = new Twisty2DSVG();
          break;
        case "3D":
          console.log("3D!");
          this.element = new Twisty3DWrapper();
          break;
      }
    }
  }
}

export class TwistyPlayerModel {
  algProp: AlgProp;
  puzzleProp: PuzzleProp;
  displayAlgProp: DisplayAlgProp;
  visualizationProp: VisualizationProp;

  constructor() {
    this.algProp = new AlgProp();
    this.puzzleProp = new PuzzleProp();
    this.displayAlgProp = new DisplayAlgProp(this.algProp, this.puzzleProp);
    this.visualizationProp = new VisualizationProp();
  }

  set alg(newAlg: Alg | string) {
    this.algProp.alg = newAlg;
  }

  get alg(): Alg {
    return this.algProp.alg;
  }

  set puzzleID(puzzleID: PuzzleID) {
    this.puzzleProp.puzzleID = puzzleID;
  }

  get puzzleID(): PuzzleID {
    return this.puzzleProp.puzzleID;
  }

  get puzzleLoader(): PuzzleLoader {
    return this.puzzleProp.puzzleLoader;
  }

  algIssues(): Promise<AlgIssues> {
    return this.displayAlgProp.algIssues();
  }
}
