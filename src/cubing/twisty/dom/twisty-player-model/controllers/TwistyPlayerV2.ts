import type { Alg } from "../../../../alg";
import type { MillisecondTimestamp } from "../../../animation/cursor/CursorTypes";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { PuzzleID } from "../../TwistyPlayerConfig";
import { Twisty3DProp } from "../props/depth-8/Twisty3DProp";
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

  constructor() {
    super();

    this.model.puzzle = "gigaminx";
  }

  async connectedCallback(): Promise<void> {
    const sceneWrapper = new Twisty3DSceneWrapper();
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

    this.model.algProp.set(
      "(BL2 B2' DL2' B' BL' B' DL2' BL2 B' BL2' B2 BL DL2 B' DL BL B' BL2 DR2 U' (F2 FR2' D2 FR L2' 1-4BR 1-4R2' U)5 F2 FR2' D2 FR L2' 1-4BR 1-4R2' U2 2DR2 u2' 1-3R2 1-3BR' l2 fr' d2' fr2 f2' (u' 1-3R2 1-3BR' l2 fr' d2' fr2 f2')5 u dr2' bl2' b bl' dl' b dl2' bl' b2' bl2 b bl2' dl2 b bl b dl2 b2 bl2')2",
    );
    const twisty3DProp = new Twisty3DProp({ puzzleID: this.model.puzzleProp });

    const scene = await sceneWrapper.scene();
    const twisty3D = await twisty3DProp.get();

    this.model.positionProp.addListener(
      async () => {
        twisty3D.onPositionChange(await this.model.positionProp.get());
        sceneWrapper.scheduleRender();
      },
      { initial: true },
    );

    scene.add(twisty3D);

    sceneWrapper.scheduleRender();
  }

  set alg(newAlg: Alg | string) {
    this.model.algProp.set(newAlg);
  }

  set setup(newSetup: Alg | string) {
    this.model.setupProp.set(newSetup);
  }

  set puzzle(puzzleID: PuzzleID) {
    this.model.puzzleProp.set(puzzleID);
  }

  set timestamp(timestamp: MillisecondTimestamp) {
    this.model.timestampRequestProp.set(timestamp);
  }
}

customElementsShim.define("twisty-player-v2", TwistyPlayerV2);
