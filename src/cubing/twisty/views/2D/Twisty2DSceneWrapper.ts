import type { Scene as ThreeScene } from "three";
import type { Schedulable } from "../../old/animation/RenderScheduler";
import { ManagedCustomElement } from "../../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../../old/dom/element/node-custom-element-shims";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { twistyViewerWrapperCSS } from "../../old/dom/viewers/TwistyViewerWrapper.css";
import { THREEJS } from "../../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { FreshListenerManager } from "../../model/TwistyProp";
import { Twisty2DPuzzleWrapper } from "./Twisty2DPuzzleWrapper";
import type { PuzzleLoader } from "../../../puzzles";

export class Twisty2DSceneWrapper
  extends ManagedCustomElement
  implements Schedulable
{
  #freshListenerManager = new FreshListenerManager();
  disconnect(): void {
    this.#freshListenerManager.disconnect();
  }

  constructor(
    public model?: TwistyPlayerModel,
    private effectiveVisualization?: "2D" | "experimental-2D-LL",
  ) {
    super();
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(twistyViewerWrapperCSS);
    if (this.model) {
      this.#freshListenerManager.addListener(
        this.model.puzzleLoaderProp,
        this.onPuzzleLoader.bind(this),
      );
    }
  }

  #cachedScene: Promise<ThreeScene> | null;
  async scene(): Promise<ThreeScene> {
    return (this.#cachedScene ??= (async () => new (await THREEJS).Scene())());
  }

  scheduleRender(): void {
    this.#currentTwisty2DPuzzleWrapper?.scheduleRender();
  }

  #currentTwisty2DPuzzleWrapper: Twisty2DPuzzleWrapper | null = null;
  currentTwisty2DPuzzleWrapper(): Twisty2DPuzzleWrapper | null {
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
      this.model!,
      this,
      puzzleLoader,
      this.effectiveVisualization!,
    );

    this.setCurrentTwisty2DPuzzleWrapper(twisty2DPuzzleWrapper);
  }
}

customElementsShim.define("twisty-2d-scene-wrapper", Twisty2DSceneWrapper);
