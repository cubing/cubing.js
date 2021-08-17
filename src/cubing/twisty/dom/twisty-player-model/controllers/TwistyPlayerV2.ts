import type { ExperimentalStickering } from "../../..";
import type { Alg } from "../../../../alg";
import type { MillisecondTimestamp } from "../../../animation/cursor/CursorTypes";
import { ClassListManager } from "../../element/ClassListManager";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
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
import {
  TwistyPlayerController,
  TwistyPlayerModel,
} from "../props/TwistyPlayerModel";
import { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";
import { TwistyButtonsV2 } from "./TwistyButtonsV2";
import { TwistyScrubberV2 } from "./TwistyScrubberV2";

export class TwistyPlayerV2 extends ManagedCustomElement {
  model: TwistyPlayerModel = new TwistyPlayerModel();
  controller: TwistyPlayerController = new TwistyPlayerController(this.model);

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

  async connectedCallback(): Promise<void> {
    this.addCSS(twistyPlayerCSS);

    const sceneWrapper = new Twisty3DSceneWrapper(this.model);
    this.contentWrapper.appendChild(sceneWrapper);

    const scrubber = new TwistyScrubberV2(this.model);
    this.contentWrapper.appendChild(scrubber);

    this.buttons = new TwistyButtonsV2(this.model, this.controller);
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
  }

  set alg(newAlg: Alg | string) {
    this.model.algProp.set(newAlg);
  }

  get alg(): never {
    throw new Error("Cannot get `.alg` directly from a `TwistyPlayer`.");
  }

  set setup(newSetup: Alg | string) {
    this.model.setupProp.set(newSetup);
  }

  get setup(): never {
    throw new Error("Cannot get `.setup` directly from a `TwistyPlayer`.");
  }

  set anchor(anchor: SetupToLocation) {
    this.model.setupAnchorProp.set(anchor);
  }

  get anchor(): never {
    throw new Error("Cannot get `.anchor` directly from a `TwistyPlayer`.");
  }

  set puzzle(puzzleID: PuzzleID) {
    this.model.puzzleProp.set(puzzleID);
  }

  get puzzle(): never {
    throw new Error("Cannot get `.puzzle` directly from a `TwistyPlayer`.");
  }

  set timestamp(timestamp: MillisecondTimestamp) {
    this.model.timestampRequestProp.set(timestamp);
  }

  get timestamp(): never {
    throw new Error("Cannot get `.timestamp` directly from a `TwistyPlayer`.");
  }

  set hintFacelets(hintFaceletStyle: HintFaceletStyleWithAuto) {
    this.model.hintFaceletProp.set(hintFaceletStyle);
  }

  get hintFacelets(): never {
    throw new Error(
      "Cannot get `.hintFacelets` directly from a `TwistyPlayer`.",
    );
  }

  set stickering(stickering: ExperimentalStickering) {
    this.model.stickeringProp.set(stickering);
  }

  get stickering(): never {
    throw new Error("Cannot get `.stickering` directly from a `TwistyPlayer`.");
  }

  set backView(backView: BackViewLayoutWithAuto) {
    this.model.backViewProp.set(backView);
  }

  get backView(): never {
    throw new Error("Cannot get `.backView` directly from a `TwistyPlayer`.");
  }

  set background(backgroundTheme: BackgroundThemeWithAuto) {
    this.model.backgroundProp.set(backgroundTheme);
  }

  get background(): never {
    throw new Error("Cannot get `.background` directly from a `TwistyPlayer`.");
  }

  set controlPanel(newControlPanel: ControlPanelThemeWithAuto) {
    this.model.controlPanelProp.set(newControlPanel);
  }

  get controlPanel(): never {
    throw new Error(
      "Cannot get `.controlPanel` directly from a `TwistyPlayer`.",
    );
  }
}

customElementsShim.define("twisty-player-v2", TwistyPlayerV2);
