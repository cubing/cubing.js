import type { Scene as ThreeScene } from "three";
import type { Schedulable } from "../../../animation/RenderScheduler";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { twistyViewerWrapperCSS } from "../../viewers/TwistyViewerWrapper.css_";
import { THREEJS } from "../heavy-code-imports/3d";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import { FreshListenerManager } from "../props/TwistyProp";
import { Twisty2DPuzzleWrapper } from "./Twisty2DPuzzleWrapper";

export class Twisty2DSceneWrapper
  extends ManagedCustomElement
  implements Schedulable
{
  #freshListenerManager = new FreshListenerManager();
  disconnect(): void {
    this.#freshListenerManager.disconnect();
  }

  constructor(public model?: TwistyPlayerModel) {
    super();
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(twistyViewerWrapperCSS);
    if (this.model) {
      this.#freshListenerManager.addListener(
        this.model.puzzleProp,
        this.onPuzzle.bind(this),
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

  async onPuzzle(puzzle: PuzzleID): Promise<void> {
    this.#currentTwisty2DPuzzleWrapper?.disconnect();
    const twisty2DPuzzleWrapper = new Twisty2DPuzzleWrapper(
      this.model!,
      this,
      puzzle,
    );

    this.setCurrentTwisty2DPuzzleWrapper(twisty2DPuzzleWrapper);
  }
}

customElementsShim.define("twisty-2d-scene-wrapper", Twisty2DSceneWrapper);
