import type { ExperimentalStickering } from "../../..";
import type { Alg } from "../../../../alg";
import type { MillisecondTimestamp } from "../../../animation/cursor/CursorTypes";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { PuzzleID, SetupToLocation } from "../../TwistyPlayerConfig";
import type { HintFaceletStyleWithAuto } from "../props/depth-1/HintFaceletProp";
import {
  TwistyPlayerController,
  TwistyPlayerModel,
} from "../props/TwistyPlayerModel";
import { Twisty3DSceneWrapper } from "./Twisty3DSceneWrapper";
import { Twisty3DVantage } from "./Twisty3DVantage";
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

  async connectedCallback(): Promise<void> {
    const sceneWrapper = new Twisty3DSceneWrapper(this.model);
    this.contentWrapper.appendChild(sceneWrapper);

    const vantage = new Twisty3DVantage(sceneWrapper);
    this.contentWrapper.appendChild(vantage);

    const scrubber = new TwistyScrubberV2(this.model);
    this.contentWrapper.appendChild(scrubber);

    this.buttons = new TwistyButtonsV2(this.model, this.controller);
    this.contentWrapper.appendChild(this.buttons);

    sceneWrapper.setAttribute("style", "width: 256px; height: 256px;");
    vantage.setAttribute("style", "width: 256px; height: 256px;");
    (await vantage.scene!).setAttribute(
      "style",
      "width: 256px; height: 256px;",
    );

    sceneWrapper.scheduleRender();
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
}

customElementsShim.define("twisty-player-v2", TwistyPlayerV2);
