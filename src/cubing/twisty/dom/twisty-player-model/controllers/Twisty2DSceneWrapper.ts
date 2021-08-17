import type { Scene as ThreeScene } from "three";
import type { Schedulable } from "../../../animation/RenderScheduler";
import { ClassListManager } from "../../element/ClassListManager";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import type { BackViewLayout } from "../../viewers/TwistyViewerWrapper";
import { twistyViewerWrapperCSS } from "../../viewers/TwistyViewerWrapper.css_";
import { THREEJS } from "../heavy-code-imports/3d";
import type { BackViewLayoutWithAuto } from "../props/depth-0/BackViewProp";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import { FreshListenerManager } from "../props/TwistyProp";
import { StaleDropper } from "./PromiseFreshener";
import { Twisty3DPuzzleWrapper } from "./Twisty3DPuzzleWrapper";
import { Twisty3DVantage } from "./Twisty3DVantage";

export class Twisty2DSceneWrapper
  extends ManagedCustomElement
  implements Schedulable
{
  #backViewClassListManager: ClassListManager<BackViewLayoutWithAuto> =
    new ClassListManager(this, "back-view-", [
      "auto",
      "none",
      "side-by-side",
      "top-right",
    ]);

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
      this.#freshListenerManager.addListener(
        this.model.backViewProp,
        this.onBackView.bind(this),
      );
    }
  }

  #backViewVantage: Twisty3DVantage | null = null;
  setBackView(backView: BackViewLayout): void {
    const shouldHaveBackView = ["side-by-side", "top-right"].includes(backView);
    const hasBackView = this.#backViewVantage !== null;

    this.#backViewClassListManager.setValue(backView);
    if (shouldHaveBackView) {
      if (!hasBackView) {
        this.#backViewVantage = new Twisty3DVantage(this.model, this as any, {
          backView: true,
        });
        this.addVantage(this.#backViewVantage);
        this.scheduleRender();
      }
    } else {
      if (this.#backViewVantage) {
        this.removeVantage(this.#backViewVantage);
        this.#backViewVantage = null;
      }
    }
  }

  onBackView(backView: BackViewLayout): void {
    this.setBackView(backView);
  }

  #cachedScene: Promise<ThreeScene> | null;
  async scene(): Promise<ThreeScene> {
    return (this.#cachedScene ??= (async () => new (await THREEJS).Scene())());
  }

  #vantages: Set<Twisty3DVantage> = new Set();
  addVantage(vantage: Twisty3DVantage) {
    this.#vantages.add(vantage);
    this.contentWrapper.appendChild(vantage);
  }

  removeVantage(vantage: Twisty3DVantage) {
    this.#vantages.delete(vantage);
    vantage.remove();
    vantage.disconnect();
  }

  scheduleRender(): void {
    for (const vantage of this.#vantages) {
      vantage.scheduleRender();
    }
  }

  #currentTwisty3DPuzzleWrapper: Twisty3DPuzzleWrapper | null = null;
  // #oldTwisty3DPuzzleWrappers: Twisty3DPuzzleWrapper[] = []; // TODO: Animate these out.
  async setCurrentTwisty3DPuzzleWrapper(
    scene: ThreeScene,
    twisty3DPuzzleWrapper: Twisty3DPuzzleWrapper,
  ): Promise<void> {
    const old = this.#currentTwisty3DPuzzleWrapper;
    this.#currentTwisty3DPuzzleWrapper = twisty3DPuzzleWrapper;
    old?.disconnect();
    scene.add(await twisty3DPuzzleWrapper.twisty3DPuzzle());
    if (old) {
      // We wait for the new puzzle to be in place before removing the old one.
      scene.remove(await old.twisty3DPuzzle());
    }
  }

  #twisty3DStaleDropper: StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]> =
    new StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]>();

  async onPuzzle(puzzle: PuzzleID): Promise<void> {
    this.#currentTwisty3DPuzzleWrapper?.disconnect();
    const [scene, twisty3DPuzzleWrapper] =
      await this.#twisty3DStaleDropper.queue(
        Promise.all([
          this.scene(),
          new Twisty3DPuzzleWrapper(this.model!, this, puzzle), // TODO
        ]),
      );

    this.setCurrentTwisty3DPuzzleWrapper(scene, twisty3DPuzzleWrapper);
  }
}

customElementsShim.define("twisty-2d-scene-wrapper", Twisty2DSceneWrapper);
