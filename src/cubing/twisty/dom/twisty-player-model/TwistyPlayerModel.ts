import type { VisualizationFormat } from "../../../../../dist/types/twisty/dom/TwistyPlayerConfig";
import { PuzzleLoader, puzzles } from "../../..//puzzles";
import { Alg } from "../../../alg";
import { KPuzzle } from "../../../kpuzzle";
import type { Cube3D } from "../../3D/puzzles/Cube3D";
import type { PG3D } from "../../3D/puzzles/PG3D";
import type { Twisty3DScene } from "../../3D/Twisty3DScene";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { customElementsShim } from "../element/node-custom-element-shims";
import type { PuzzleID } from "../TwistyPlayerConfig";
import { Twisty2DSVG } from "../viewers/Twisty2DSVG";
import type { Twisty3DCanvas } from "../viewers/Twisty3DCanvas";
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

interface DerivedAlgInfo {
  alg: Alg;
  algIssues: AlgIssues;
}

class DerivedAlgProp extends EventTarget {
  algSource: ManagedSource<AlgProp>;

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
    console.log("DerivedAlgProp.onAlg");
    this.#cachedDerivedAlgInfo = null;
    this.dispatchEvent(new CustomEvent("update"));
  }

  onPuzzle() {
    this.#cachedDerivedAlgInfo = null;
    this.dispatchEvent(new CustomEvent("update"));
  }

  async alg(): Promise<Alg> {
    return (await this.#derive()).alg;
  }

  async algIssues(): Promise<AlgIssues> {
    // TODO: handle string sources to compare caononicalization.
    return (await this.#derive()).algIssues;
  }

  #cachedDerivedAlgInfo: Promise<DerivedAlgInfo> | null = null;
  async #derive(): Promise<DerivedAlgInfo> {
    return (this.#cachedDerivedAlgInfo ??=
      (async (): Promise<DerivedAlgInfo> => {
        console.log("DerivedAlgProp deriving!");
        const algIssues = this.algSource.target.algIssues.clone();
        let alg: Alg | null = null;
        try {
          const maybeAlg = this.algSource.target.alg; // TODO: Can we get a frozen reference before doing anything async?
          const def = await this.puzzleSource.target.puzzleLoader.def();
          const kpuzzle = new KPuzzle(def);
          kpuzzle.applyAlg(maybeAlg);
          // Looks like we could apply the alg!
          alg = maybeAlg;
        } catch (e) {
          algIssues.errors.push(`Invalid alg for puzzle: ${e}`);
        }
        return { alg: alg ?? new Alg(), algIssues };
      })());
  }
}

class Twisty3DWrapper extends ManagedCustomElement {
  #puzzleProp: PuzzleProp;
  constructor(puzzleProp: PuzzleProp) {
    super();
    this.#puzzleProp = puzzleProp;
    this.#puzzleProp.addEventListener("update", this.onPuzzle.bind(this));
  }

  onPuzzle(): void {
    // TODO: Check if puzzle changed.
    this.#clearTwisty3DPuzzles();
    this.pullTwisty3D();
  }

  connectedCallback() {
    console.log("connected!");
    this.contentWrapper.textContent = "wrapper!";
    (async () => {
      this.pullTwisty3D(); // Note: we specifically don't await.
      this.appendChild(await this.mainCanvas());
    })();
  }

  // TODO can we remove the cached proxy?
  // In theory we can, but we've run into situations where imports are not properly cached.
  #cachedConstructorProxy: Promise<typeof import("./3d-proxy")> | null = null;
  async constructorProxy(): Promise<typeof import("./3d-proxy")> {
    return (this.#cachedConstructorProxy ??= import("./3d-proxy"));
  }

  #cachedScene: Promise<Twisty3DScene> | null = null;
  async scene(): Promise<Twisty3DScene> {
    return (this.#cachedScene ??= (async () =>
      new (await this.constructorProxy()).Twisty3DScene())());
  }

  #cachedMainCanvas: Promise<Twisty3DCanvas> | null = null;
  async mainCanvas(): Promise<Twisty3DCanvas> {
    return (this.#cachedMainCanvas ??= (async () =>
      new (await this.constructorProxy()).Twisty3DCanvas(
        await this.scene(),
      ))());
  }

  // TODO: Why can't we use `Twisty3DPuzzle` instead of `Cube3D | PG3D`?
  #cachedTwisty3D: Promise<Cube3D | PG3D> | null = null;
  async twisty3D(): Promise<Cube3D | PG3D> {
    return (this.#cachedTwisty3D ??= (async () => {
      switch (this.#puzzleProp.puzzleID) {
        case "3x3x3":
          return await (await this.constructorProxy()).cube3DShim();
        default: {
          const pg3d: PG3D = await (
            await this.constructorProxy()
          ).pg3dShim(this.#puzzleProp.puzzleID);
          return pg3d;
        }
      }
    })());
  }

  async pullTwisty3D(): Promise<void> {
    this.#addTwisty3D(await this.twisty3D());
  }

  #twisty3DPuzzlesInScene: Set<Cube3D | PG3D> = new Set();
  async #addTwisty3D(twisty3D: Cube3D | PG3D): Promise<void> {
    if (!this.#twisty3DPuzzlesInScene.has(twisty3D)) {
      (await this.scene()).add(twisty3D); // TODO: Prevent double add?
      this.#twisty3DPuzzlesInScene.add(twisty3D);
    }
  }

  async #clearTwisty3DPuzzles(): Promise<void> {
    for (const twisty3D of this.#twisty3DPuzzlesInScene) {
      (await this.scene()).remove(twisty3D);
    }
  }
}
customElementsShim.define("twisty-3d-wrapper", Twisty3DWrapper);

type DerivedVisualizationFormat = "2D" | "3D" | null;

class VisualizationProp {
  #displayAlgProp: DerivedAlgProp;
  #puzzleProp: PuzzleProp;

  constructor(derivedAlgProp: DerivedAlgProp, puzzleProp: PuzzleProp) {
    this.#displayAlgProp = derivedAlgProp;
    this.#displayAlgProp.addEventListener(
      "update",
      this.onDerivedAlg.bind(this),
    );
    this.#puzzleProp = puzzleProp;
    this.#puzzleProp.addEventListener("update", this.onPuzzle.bind(this));
  }

  async onDerivedAlg(): Promise<void> {
    console.log("VisualizationProp.onDerivedAlg");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    const div = this.wrapperElement.appendChild(document.createElement("div"));
    div.append(` | alg = ${await this.#displayAlgProp.alg()}`);
  }

  onPuzzle(): void {
    console.log("VisualizationProp.onPuzzle");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    const div = this.wrapperElement.appendChild(document.createElement("div"));
    div.append(` | puzzle = ${this.#puzzleProp.puzzleID}`);
  }

  #visualizationInput: VisualizationFormat | null = null;
  #cachedDerivedVisualization: DerivedVisualizationFormat = null; // TODO: `null` is an actual value.

  private get derivedVisualization(): DerivedVisualizationFormat {
    return (this.#cachedDerivedVisualization ??= ["2D", null].includes(
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
          this.element = new Twisty3DWrapper(this.#puzzleProp);
          break;
      }
    }
  }
}

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
