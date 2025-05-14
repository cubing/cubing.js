import type {
  PerspectiveCamera,
  Scene as ThreeScene,
} from "three/src/Three.js";
import type { PuzzleLoader } from "../../../puzzles";
import type { Schedulable } from "../../controllers/RenderScheduler";
import { bulk3DCode } from "../../heavy-code-imports/3d";
import { StaleDropper } from "../../model/PromiseFreshener";
import { FreshListenerManager } from "../../model/props/TwistyProp";
import type { BackViewLayout as BackViewLayoutWithAuto } from "../../model/props/viewer/BackViewProp";
import type { VisualizationStrategy } from "../../model/props/viewer/VisualizationStrategyProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { ClassListManager } from "../ClassListManager";
import { InitialValueTracker } from "../InitialValueTracker";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { twistyViewerWrapperCSS } from "../TwistyViewerWrapper.css";
import type { PressInfo } from "./DragTracker";
import { Twisty3DPuzzleWrapper } from "./Twisty3DPuzzleWrapper";
import { Twisty3DVantage } from "./Twisty3DVantage";

export class Twisty3DSceneWrapper
  extends ManagedCustomElement
  implements Schedulable
{
  // @ts-ignore TypeScript type inference appears to be borked: ts(2322)
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
        [this.model.puzzleLoader, this.model.visualizationStrategy],
        this.onPuzzle.bind(this),
      );
      this.#freshListenerManager.addListener(
        this.model.backView,
        // @ts-ignore TypeScript type inference appears to be borked: ts(2322)
        this.setBackView.bind(this),
      );
    }
    this.scheduleRender();
  }

  #backViewVantage: Twisty3DVantage | null = null;
  setBackView(backView: BackViewLayoutWithAuto): void {
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
      const [camera, { ThreeRaycaster, ThreeVector2 }] = await Promise.all([
        e.detail.cameraPromise,
        (async () => {
          const { ThreeRaycaster, ThreeVector2 } = await bulk3DCode();
          return { ThreeRaycaster, ThreeVector2 };
        })(),
      ]);

      const raycaster = new ThreeRaycaster();
      const mouse = new ThreeVector2(
        e.detail.pressInfo.normalizedX,
        e.detail.pressInfo.normalizedY,
      );
      raycaster.setFromCamera(mouse, camera);
      return raycaster;
    })();

    twisty3DPuzzleWrapper.raycastMove(raycasterPromise, {
      invert: !e.detail.pressInfo.rightClick,
      depth: e.detail.pressInfo.keys.ctrlOrMetaKey
        ? "rotation"
        : e.detail.pressInfo.keys.shiftKey
          ? "secondSlice"
          : "none",
    });
  }

  #cachedScene?: Promise<ThreeScene>;
  async scene(): Promise<ThreeScene> {
    return (this.#cachedScene ??= (async () =>
      new (await bulk3DCode()).ThreeScene())());
  }

  #vantages: Set<Twisty3DVantage> = new Set();
  addVantage(vantage: Twisty3DVantage) {
    vantage.addEventListener(
      "press",
      this.onPress.bind(this) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
    );
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
    try {
      this.#currentTwisty3DPuzzleWrapper = twisty3DPuzzleWrapper;
      old?.disconnect();
      scene.add(await twisty3DPuzzleWrapper.twisty3DPuzzle());
    } finally {
      if (old) {
        // We wait for the new puzzle to be in place before removing the old one.
        scene.remove(await old.twisty3DPuzzle());
      }
    }
    this.#initialWrapperTracker.handleNewValue(twisty3DPuzzleWrapper);
  }

  #initialWrapperTracker = new InitialValueTracker<Twisty3DPuzzleWrapper>();
  /** @deprecated */
  async experimentalTwisty3DPuzzleWrapper(): Promise<Twisty3DPuzzleWrapper> {
    return (
      this.#currentTwisty3DPuzzleWrapper || this.#initialWrapperTracker.promise
    );
  }

  #twisty3DStaleDropper: StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]> =
    new StaleDropper<[ThreeScene, Twisty3DPuzzleWrapper]>();

  async onPuzzle(
    inputs: [
      puzzleLoader: PuzzleLoader,
      visualizationStrategy: VisualizationStrategy,
    ],
  ): Promise<void> {
    if (inputs[1] === "2D") {
      // We are being asked to render with stale info. Ignore.
      return;
    }
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
