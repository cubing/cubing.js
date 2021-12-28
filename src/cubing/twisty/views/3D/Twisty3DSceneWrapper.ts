import { PerspectiveCamera, Scene as ThreeScene, Vector2 } from "three";
import type { PuzzleLoader } from "../../../puzzles";
import { THREEJS } from "../../heavy-code-imports/3d";
import { StaleDropper } from "../../model/PromiseFreshener";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { BackViewLayoutWithAuto } from "../../model/props/viewer/BackViewProp";
import type { VisualizationStrategy } from "../../model/props/viewer/VisualizationStrategyProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import type { Schedulable } from "../../old/animation/RenderScheduler";
import { ClassListManager } from "../../old/dom/element/ClassListManager";
import { ManagedCustomElement } from "../../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../../old/dom/element/node-custom-element-shims";
import type { BackViewLayout } from "../../old/dom/viewers/TwistyViewerWrapper";
import { twistyViewerWrapperCSS } from "../../old/dom/viewers/TwistyViewerWrapper.css";
import type { PressInfo } from "./DragTracker";
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
        [this.model.puzzleLoaderProp, this.model.visualizationStrategyProp],
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

  async onPress(
    e: CustomEvent<{
      pressInfo: PressInfo;
      cameraPromise: Promise<PerspectiveCamera>;
    }>,
  ): Promise<void> {
    const twisty3DPuzzleWrapper = this.#currentTwisty3DPuzzleWrapper;
    if (!twisty3DPuzzleWrapper) {
      console.info("no wrapper; skipping scene wrapper press!");
      return;
    }

    const raycasterPromise = (async () => {
      const [camera, three] = await Promise.all([
        e.detail.cameraPromise,
        THREEJS,
      ]);

      const raycaster = new three.Raycaster();
      const mouse = new Vector2(
        e.detail.pressInfo.normalizedX,
        e.detail.pressInfo.normalizedY,
      );
      raycaster.setFromCamera(mouse, camera);
      return raycaster;
    })();

    twisty3DPuzzleWrapper.raycastMove(
      raycasterPromise,
      !e.detail.pressInfo.rightClick,
    );
  }

  #cachedScene: Promise<ThreeScene> | null;
  async scene(): Promise<ThreeScene> {
    return (this.#cachedScene ??= (async () => new (await THREEJS).Scene())());
  }

  #vantages: Set<Twisty3DVantage> = new Set();
  addVantage(vantage: Twisty3DVantage) {
    vantage.addEventListener("press", this.onPress.bind(this));
    this.#vantages.add(vantage);
    this.contentWrapper.appendChild(vantage);
  }

  removeVantage(vantage: Twisty3DVantage) {
    this.#vantages.delete(vantage);
    vantage.remove();
    vantage.disconnect();
    this.#currentTwisty3DPuzzleWrapper?.disconnect();
  }

  experimentalVantages(): Iterable<Twisty3DVantage> {
    return this.#vantages.values();
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
    inputs: [
      puzzleLoader: PuzzleLoader,
      visualizationStrategy: VisualizationStrategy,
    ],
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
