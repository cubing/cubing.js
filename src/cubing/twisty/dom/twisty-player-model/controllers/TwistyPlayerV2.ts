import type { ExperimentalStickering } from "../../..";
import { ClassListManager } from "../../element/ClassListManager";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { twistyPlayerCSS } from "../../TwistyPlayer.css_";
import {
  controlsLocations,
  PuzzleID,
  SetupToLocation,
} from "../../TwistyPlayerConfig";
import type { BackgroundThemeWithAuto } from "../props/depth-0/BackgroundProp";
import type { ControlPanelThemeWithAuto } from "../props/depth-0/ControlPanelProp";
import type { VisualizationFormatWithAuto } from "../props/depth-0/VisualizationProp";
import { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import { Twisty2DSceneWrapper } from "./2D/Twisty2DSceneWrapper";
import { Twisty3DSceneWrapper } from "./3D/Twisty3DSceneWrapper";
import { TwistyButtonsV2 } from "./control-panel/TwistyButtonsV2";
import { TwistyScrubberV2 } from "./control-panel/TwistyScrubberV2";
import type { TwistyAnimationControllerDelegate } from "./TwistyAnimationController";
import { TwistyPlayerController } from "./TwistyPlayerController";
import { TwistyPlayerSettable } from "./TwistyPlayerSettable";

export class TwistyPlayerV2
  extends TwistyPlayerSettable
  implements TwistyAnimationControllerDelegate
{
  model: TwistyPlayerModel = new TwistyPlayerModel();
  controller: TwistyPlayerController = new TwistyPlayerController(
    this.model,
    this,
  );

  buttons: TwistyButtonsV2;

  constructor(options?: { puzzle?: PuzzleID }) {
    super();

    if (options?.puzzle) {
      this.model.puzzle = options.puzzle;
    }
  }

  #controlsManager: ClassListManager<ControlPanelThemeWithAuto> =
    new ClassListManager<ControlPanelThemeWithAuto>(
      this,
      "controls-",
      (["auto"] as ControlPanelThemeWithAuto[]).concat(
        Object.keys(controlsLocations) as ControlPanelThemeWithAuto[],
      ),
    );

  #visualizationWrapperElem = document.createElement("div"); // TODO: Better pattern.
  async connectedCallback(): Promise<void> {
    this.addCSS(twistyPlayerCSS);

    this.addElement(this.#visualizationWrapperElem).classList.add(
      "visualization-wrapper",
    );

    const scrubber = new TwistyScrubberV2(this.model);
    this.contentWrapper.appendChild(scrubber);

    this.buttons = new TwistyButtonsV2(this.model, this.controller, this);
    this.contentWrapper.appendChild(this.buttons);

    this.model.backgroundProp.addFreshListener(
      (backgroundTheme: BackgroundThemeWithAuto) => {
        this.contentWrapper.classList.toggle(
          "checkered",
          backgroundTheme !== "none",
        );
      },
    );

    this.model.controlPanelProp.addFreshListener(
      (controlPanel: ControlPanelThemeWithAuto) => {
        this.#controlsManager.setValue(controlPanel);
      },
    );

    this.model.effectiveVisualizationFormatProp.addFreshListener(
      this.#setVisualizationWrapper.bind(this),
    );
  }

  flashAutoSkip() {
    this.#visualizationWrapper?.animate([{ opacity: 0.25 }, { opacity: 1 }], {
      duration: 250,
    });
  }

  #visualizationWrapper: Twisty2DSceneWrapper | Twisty3DSceneWrapper | null =
    null;

  #visualizationStrategy: "2D" | "3D" | null = null;
  #setVisualizationWrapper(strategy: "2D" | "3D"): void {
    if (strategy !== this.#visualizationStrategy) {
      this.#visualizationWrapper?.remove();
      this.#visualizationWrapper?.disconnect();
      let newWrapper: Twisty2DSceneWrapper | Twisty3DSceneWrapper;
      switch (strategy) {
        case "2D":
          newWrapper = new Twisty2DSceneWrapper(this.model);
          break;
        case "3D":
          newWrapper = new Twisty3DSceneWrapper(this.model);
          break;
        default:
          throw new Error("Invalid visualization");
      }
      this.#visualizationWrapperElem.appendChild(newWrapper);
      this.#visualizationWrapper = newWrapper;
      this.#visualizationStrategy = strategy;
    }
  }

  jumpToStart(options?: { flash: boolean }): void {
    this.controller.jumpToStart(options);
  }

  jumpToEnd(options?: { flash: boolean }): void {
    this.controller.jumpToEnd(options);
  }

  play(): void {
    this.controller.togglePlay(true);
  }

  pause(): void {
    this.controller.togglePlay(false);
  }

  // Inspiration:
  // - https://developer.mozilla.org/en-US/docs/Web/API/Element/toggleAttribute (`force` argument)
  // - https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle (`force` argument)
  // We still provide `play()` and `pause()` individually for convenience, though.
  togglePlay(play?: boolean): void {
    this.controller.togglePlay(play);
  }

  static get observedAttributes(): string[] {
    return ["alg"];
  }

  attributeChangedCallback(
    attributeName: string,
    _oldValue: string,
    newValue: string,
  ): void {
    switch (attributeName) {
      case "alg":
        this.alg = newValue;
        return;
      case "control-panel":
        this.controlPanel = newValue as ControlPanelThemeWithAuto;
        return;
      case "visualization": //"experimental-2D-LL"
        this.visualization = newValue as VisualizationFormatWithAuto;
        return;
      case "experimental-stickering": //"OLL"
        this.experimentalStickering = newValue as ExperimentalStickering;
        return;
      case "experimental-setup-anchor": //"end"
        this.experimentalSetupAnchor = newValue as SetupToLocation;
        return;
      case "background": //"none"
        this.background = newValue as BackgroundThemeWithAuto;
        return;
    }
  }
}

customElementsShim.define("twisty-player-v2", TwistyPlayerV2);
