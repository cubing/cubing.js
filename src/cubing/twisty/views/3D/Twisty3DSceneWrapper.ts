import type { Scene as ThreeScene } from "three";
import { THREEJS } from "../../heavy-code-imports/3d";
import type { BackViewLayoutWithAuto } from "../../model/depth-0/BackViewProp";
import type { VisualizationStrategy } from "../../model/depth-1/VisualizationStrategyProp";
import { StaleDropper } from "../../model/PromiseFreshener";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { FreshListenerManager } from "../../model/TwistyProp";
import type { Schedulable } from "../../old/animation/RenderScheduler";
import { ClassListManager } from "../../old/dom/element/ClassListManager";
import { ManagedCustomElement } from "../../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../../old/dom/element/node-custom-element-shims";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import type { BackViewLayout } from "../../old/dom/viewers/TwistyViewerWrapper";
import { twistyViewerWrapperCSS } from "../../old/dom/viewers/TwistyViewerWrapper.css_";
import { Twisty3DPuzzleWrapper } from "./Twisty3DPuzzleWrapper";
import { Twisty3DVantage } from "./Twisty3DVantage";

export class Twisty3DSceneWrapper
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
    const vantage = new Twisty3DVantage(this.model, this);
    this.addVantage(vantage);
    if (this.model) {
      this.#freshListenerManager.addMultiListener(
        [this.model.puzzleIDProp, this.model.visualizationStrategyProp],
        this.onPuzzle.bind(this),
      );
      this.#freshListenerManager.addListener(
        this.model.backViewProp,
        this.onBackView.bind(this),
      );
    }
    this.scheduleRender();
  }

  #backViewVantage: Twisty3DVantage | null = null;
  setBackView(backView: BackViewLayout): void {
    const shouldHaveBackView = ["side-by-side", "top-right"].includes(backView);
    const hasBackView = this.#backViewVantage !== null;

    this.#backViewClassListManager.setValue(backView);
    if (shouldHaveBackView) {
      if (!hasBackView) {
        this.#backViewVantage = new Twisty3DVantage(this.model, this, {
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
    this.#currentTwisty3DPuzzleWrapper?.disconnect();
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

  async onPuzzle(
    inputs: [puzzle: PuzzleID, visualizationStrategy: VisualizationStrategy],
  ): Promise<void> {
    this.#currentTwisty3DPuzzleWrapper?.disconnect();
    const [scene, twisty3DPuzzleWrapper] =
      await this.#twisty3DStaleDropper.queue(
        Promise.all([
          this.scene(),
          new Twisty3DPuzzleWrapper(this.model!, this, inputs[0], inputs[1]), // TODO
        ]),
      );

    this.setCurrentTwisty3DPuzzleWrapper(scene, twisty3DPuzzleWrapper);
  }
}

customElementsShim.define("twisty-3d-scene-wrapper", Twisty3DSceneWrapper);
