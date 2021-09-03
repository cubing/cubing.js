import type { Alg, Move } from "../../alg";
import type { ExperimentalStickering } from "../../twisty";
import type { TwistyAnimationControllerDelegate } from "../controllers/TwistyAnimationController";
import { TwistyPlayerController } from "../controllers/TwistyPlayerController";
import type { BackgroundThemeWithAuto } from "../model/depth-0/BackgroundProp";
import type { BackViewLayoutWithAuto } from "../model/depth-0/BackViewProp";
import type { ControlPanelThemeWithAuto } from "../model/depth-0/ControlPanelProp";
import type { HintFaceletStyleWithAuto } from "../model/depth-0/HintFaceletProp";
import type { ViewerLinkPageWithAuto } from "../model/depth-0/ViewerLinkProp";
import type { VisualizationFormatWithAuto } from "../model/depth-0/VisualizationProp";
import type { VisualizationStrategy } from "../model/depth-1/VisualizationStrategyProp";
import { ClassListManager } from "../old/dom/element/ClassListManager";
import { customElementsShim } from "../old/dom/element/node-custom-element-shims";
import { twistyPlayerCSS } from "../old/dom/TwistyPlayer.css_";
import {
  controlsLocations,
  PuzzleID,
  SetupToLocation,
} from "../old/dom/TwistyPlayerConfig";
import { Twisty2DSceneWrapper } from "./2D/Twisty2DSceneWrapper";
import { Twisty3DSceneWrapper } from "./3D/Twisty3DSceneWrapper";
import { TwistyButtonsV2 } from "./control-panel/TwistyButtonsV2";
import { TwistyScrubberV2 } from "./control-panel/TwistyScrubberV2";
import { downloadURL, getDefaultFilename, screenshot } from "./screenshot";
import { TwistyPlayerSettable } from "./TwistyPlayerSettable";

// TODO: I couldn't figure out how to use use more specific types. Ideally, we'd
// enforce consistency with the model.
export const twistyPlayerAttributeMap = {
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

export type TwistyPlayerAttribute = keyof typeof twistyPlayerAttributeMap;

const configKeys: Record<TwistyPlayerAttribute, true> = Object.fromEntries(
  Object.values(twistyPlayerAttributeMap).map((s) => [s, true]),
) as any;

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

/**
 * TwistyPlayerV2 is the heart of `cubing.js`. It can be used to display a puzzle on a web page like this:
 *
 *     <script src="path/to/cubing/twisty" type="module"></script>
 *     <twisty-player-v2 alg="R U R'"></twisty-player-v2>
 *
 * You can also construct it directly in JavaScript:
 *
 *     import { TwistyPlayerV2 } from "cubing/twisty";
 *     const twistyPlayer = new TwistyPlayerV2({alg: "R U R'"});
 *     // Once the page has loaded, you can do this:
 *     document.body.appendChild(twistyPlayer);
 *
 * See {@link https://js.cubing.net/cubing/} for more examples.
 */
export class TwistyPlayerV2
  extends TwistyPlayerSettable
  implements TwistyAnimationControllerDelegate
{
  controller: TwistyPlayerController = new TwistyPlayerController(
    this.experimentalModel,
    this,
  );

  buttons: TwistyButtonsV2;

  constructor(config: TwistyPlayerV2Config = {}) {
    super();

    // TODO: double-check that these are all getting set sync without causing extra work.
    for (const [propName, value] of Object.entries(config)) {
      if (!configKeys[propName as TwistyPlayerAttribute]) {
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

    const scrubber = new TwistyScrubberV2(this.experimentalModel);
    this.contentWrapper.appendChild(scrubber);

    this.buttons = new TwistyButtonsV2(
      this.experimentalModel,
      this.controller,
      this,
    );
    this.contentWrapper.appendChild(this.buttons);

    this.experimentalModel.backgroundProp.addFreshListener(
      (backgroundTheme: BackgroundThemeWithAuto) => {
        this.contentWrapper.classList.toggle(
          "checkered",
          backgroundTheme !== "none",
        );
      },
    );

    this.experimentalModel.controlPanelProp.addFreshListener(
      (controlPanel: ControlPanelThemeWithAuto) => {
        this.#controlsManager.setValue(controlPanel);
      },
    );

    this.experimentalModel.visualizationStrategyProp.addFreshListener(
      this.#setVisualizationWrapper.bind(this),
    );

    this.experimentalModel.puzzleProp.addFreshListener(this.flash.bind(this));
  }

  flash() {
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
          newWrapper = new Twisty2DSceneWrapper(
            this.experimentalModel,
            strategy,
          );
          break;
        case "Cube3D":
        case "PG3D":
          // TODO: Properly wire this up so we can set PG3D for the cube.
          newWrapper = new Twisty3DSceneWrapper(this.experimentalModel);
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

  // TODO: Animate the new move.
  experimentalAddMove(move: Move): void {
    (async () => {
      const alg = (await this.experimentalModel.algProp.get()).alg;
      this.experimentalModel.algProp.set(alg.concat([move]));
      this.experimentalModel.timestampRequestProp.set("end");
    })();
  }

  static get observedAttributes(): string[] {
    return Object.keys(twistyPlayerAttributeMap);
  }

  attributeChangedCallback(
    attributeName: string,
    _oldValue: string,
    newValue: string,
  ): void {
    const setterName =
      twistyPlayerAttributeMap[attributeName as TwistyPlayerAttribute];
    if (!setterName) {
      return;
    }

    (this as any)[setterName] = newValue;
  }

  // TODO: Make this more ergonomic and flexible.
  // TODO: dimensions.
  async experimentalScreenshot(): Promise<string> {
    return (await screenshot(this.experimentalModel)).dataURL;
  }

  // TODO: Make this more ergonomic and flexible.
  // TODO: dimensions.
  async experimentalDownloadScreenshot(filename?: string): Promise<void> {
    if (
      ["2D", "experimental-2D-LL"].includes(
        await this.experimentalModel.visualizationStrategyProp.get(),
      )
    ) {
      // TODO: This has lots of async issues. It should also go into the screenshot impl file.
      const wrapper2D = this.#visualizationWrapper as Twisty2DSceneWrapper;
      const twisty2DPuzzle = await wrapper2D
        .currentTwisty2DPuzzleWrapper()!
        .twisty2DPuzzle();
      const str = new XMLSerializer().serializeToString(
        twisty2DPuzzle.svg.element,
      );
      const url = URL.createObjectURL(new Blob([str]));
      downloadURL(
        url,
        filename ?? (await getDefaultFilename(this.experimentalModel)),
        "svg",
      );
    } else {
      await (await screenshot(this.experimentalModel)).download(filename);
    }
  }
}

customElementsShim.define("twisty-player-v2", TwistyPlayerV2);
