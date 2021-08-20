import type { ExperimentalStickering } from "../../..";
import type { Alg } from "../../../../alg";
import { ClassListManager } from "../../element/ClassListManager";
import { customElementsShim } from "../../element/node-custom-element-shims";
import { twistyPlayerCSS } from "../../TwistyPlayer.css_";
import {
  controlsLocations,
  PuzzleID,
  SetupToLocation,
} from "../../TwistyPlayerConfig";
import type { BackgroundThemeWithAuto } from "../props/depth-0/BackgroundProp";
import type { BackViewLayoutWithAuto } from "../props/depth-0/BackViewProp";
import type { ControlPanelThemeWithAuto } from "../props/depth-0/ControlPanelProp";
import type { HintFaceletStyleWithAuto } from "../props/depth-0/HintFaceletProp";
import type { ViewerLinkPageWithAuto } from "../props/depth-0/ViewerLinkProp";
import type { VisualizationFormatWithAuto } from "../props/depth-0/VisualizationProp";
import type { VisualizationStrategy } from "../props/depth-1/VisualizationStrategyProp";
import { Twisty2DSceneWrapper } from "./2D/Twisty2DSceneWrapper";
import { Twisty3DSceneWrapper } from "./3D/Twisty3DSceneWrapper";
import { TwistyButtonsV2 } from "./control-panel/TwistyButtonsV2";
import { TwistyScrubberV2 } from "./control-panel/TwistyScrubberV2";
import type { TwistyAnimationControllerDelegate } from "./TwistyAnimationController";
import { TwistyPlayerController } from "./TwistyPlayerController";
import { TwistyPlayerSettable } from "./TwistyPlayerSettable";

// TODO: I couldn't figure out how to use use more specific types. Ideally, we'd
// enforce consistency with the model.
const attributeMap: Record<string, string> = {
  // TODO: We assume each of these can be set using a string or will be automatically converted by JS (e.g. numbers). Can we enforce
  // that with types? Do we need to add a translation mechanism for things we
  // don't want to leave settable as strings?
  // TODO: Enum validation.

  // Alg
  "alg": "alg",
  "experimental-setup-alg": "experimentalSetupAlg",

  // String-based
  "experimental-setup-anchor": "experimentalSetupAnchor",
  "puzzle": "puzzle",
  "visualization": "visualization",
  "hint-facelets": "hintFacelets",
  "experimental-stickering": "experimentalStickering",
  "background": "background",
  "control-panel": "controlPanel",
  "back-view": "backView",
  // "indexer": "indexer",
  "viewer-link": "viewerLink",

  // Number-based
  "camera-latitude": "cameraLatitude",
  "camera-longitude": "cameraLongitude",
  "camera-distance": "cameraDistance",
  "camera-latitude-limit": "cameraLatitudeLimit",
  "tempo-scale": "tempoScale",
};

// TODO: Why isn't this exact?
type ConfigKey = typeof attributeMap[keyof typeof attributeMap];

const configKeys: Record<ConfigKey, true> = Object.fromEntries(
  Object.values(attributeMap).map((s) => [s, true]),
);

// TODO: Find a way to share this def with `attributeMap`.
export interface TwistyPlayerV2Config {
  // Alg
  alg?: Alg | string;
  experimentalSetupAlg?: Alg | string;

  // String-based
  experimentalSetupAnchor?: SetupToLocation; // TODO: "auto"
  puzzle?: PuzzleID;
  visualization?: VisualizationFormatWithAuto;
  hintFacelets?: HintFaceletStyleWithAuto;
  experimentalStickering?: ExperimentalStickering;
  background?: BackViewLayoutWithAuto;
  controlPanel?: ControlPanelThemeWithAuto;
  backView?: BackViewLayoutWithAuto;
  // "indexer"?: "indexer";
  viewerLink?: ViewerLinkPageWithAuto;

  // NumberBased
  cameraLatitude?: number;
  cameraLongitude?: number;
  cameraDistance?: number;
  cameraLatitudeLimit?: number;
  tempoScale?: number;
}
export class TwistyPlayerV2
  extends TwistyPlayerSettable
  implements TwistyAnimationControllerDelegate
{
  controller: TwistyPlayerController = new TwistyPlayerController(
    this.model,
    this,
  );

  buttons: TwistyButtonsV2;

  constructor(config: TwistyPlayerV2Config = {}) {
    super();

    // TODO: double-check that these are all getting set sync without causing extra work.
    for (const [propName, value] of Object.entries(config)) {
      if (!configKeys[propName]) {
        console.warn(`Invalid config passed to TwistyPlayerV2: ${propName}`);
        break;
      }
      (this as any)[propName] = value;
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

    this.model.visualizationStrategyProp.addFreshListener(
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

  #visualizationStrategy: VisualizationStrategy | null = null;
  #setVisualizationWrapper(strategy: VisualizationStrategy): void {
    if (strategy !== this.#visualizationStrategy) {
      this.#visualizationWrapper?.remove();
      this.#visualizationWrapper?.disconnect();
      let newWrapper: Twisty2DSceneWrapper | Twisty3DSceneWrapper;
      switch (strategy) {
        case "2D":
        case "experimental-2D-LL":
          newWrapper = new Twisty2DSceneWrapper(this.model, strategy);
          break;
        case "Cube3D":
        case "PG3D":
          // TODO: Properly wire this up so we can set PG3D for the cube.
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
    return Object.keys(attributeMap);
  }

  attributeChangedCallback(
    attributeName: string,
    _oldValue: string,
    newValue: string,
  ): void {
    const setterName = attributeMap[attributeName];
    if (!setterName) {
      return;
    }

    (this as any)[setterName] = newValue;
  }
}

customElementsShim.define("twisty-player-v2", TwistyPlayerV2);
