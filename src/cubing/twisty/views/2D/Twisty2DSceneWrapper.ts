import type { Scene as ThreeScene } from "three/src/Three.js";
import type { PuzzleLoader } from "../../../puzzles";
import type { Schedulable } from "../../controllers/RenderScheduler";
import { bulk3DCode } from "../../heavy-code-imports/3d";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { TwistySceneModel } from "../../model/TwistySceneModel";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { twistyViewerWrapperCSS } from "../TwistyViewerWrapper.css";
import { Twisty2DPuzzleWrapper } from "./Twisty2DPuzzleWrapper";

export class Twisty2DSceneWrapper
  extends ManagedCustomElement
  implements Schedulable
{
  #freshListenerManager = new FreshListenerManager();
  disconnect(): void {
    this.#freshListenerManager.disconnect();
  }

  constructor(
    public model?: TwistySceneModel,
    private effectiveVisualization?:
      | "2D"
      | "experimental-2D-LL"
      | "experimental-2D-LL-face",
  ) {
    super();
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(twistyViewerWrapperCSS);
    if (this.model) {
      this.#freshListenerManager.addListener(
        this.model.twistyPlayerModel.puzzleLoader,
        this.onPuzzleLoader.bind(this),
      );
    }
  }

  #cachedScene?: Promise<ThreeScene>;
  async scene(): Promise<ThreeScene> {
    return (this.#cachedScene ??= (async () =>
      new (await bulk3DCode()).ThreeScene())());
  }

  scheduleRender(): void {
    this.#currentTwisty2DPuzzleWrapper?.scheduleRender();
  }

  #currentTwisty2DPuzzleWrapper: Twisty2DPuzzleWrapper | undefined;
  currentTwisty2DPuzzleWrapper(): Twisty2DPuzzleWrapper | undefined {
    return this.#currentTwisty2DPuzzleWrapper;
  }

  // #oldTwisty3DPuzzleWrappers: Twisty3DPuzzleWrapper[] = []; // TODO: Animate these out.
  async setCurrentTwisty2DPuzzleWrapper(
    twisty2DPuzzleWrapper: Twisty2DPuzzleWrapper,
  ): Promise<void> {
    const old = this.#currentTwisty2DPuzzleWrapper;
    this.#currentTwisty2DPuzzleWrapper = twisty2DPuzzleWrapper;
    old?.disconnect(); // TODO: Disconnect properly.
    const twisty2DPuzzlePromise = twisty2DPuzzleWrapper.twisty2DPuzzle();
    this.contentWrapper.textContent = ""; // Clear existing ones.
    this.addElement(await twisty2DPuzzlePromise);
  }

  async onPuzzleLoader(puzzleLoader: PuzzleLoader): Promise<void> {
    this.#currentTwisty2DPuzzleWrapper?.disconnect();
    const twisty2DPuzzleWrapper = new Twisty2DPuzzleWrapper(
      this.model!.twistyPlayerModel,
      this,
      puzzleLoader,
      this.effectiveVisualization!,
    );

    this.setCurrentTwisty2DPuzzleWrapper(twisty2DPuzzleWrapper);
  }
}

customElementsShim.define("twisty-2d-scene-wrapper", Twisty2DSceneWrapper);
