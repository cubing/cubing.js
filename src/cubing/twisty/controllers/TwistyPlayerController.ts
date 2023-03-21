import type { TwistyPlayerModel } from "../model/TwistyPlayerModel";
import {
  TwistyAnimationController,
  type TwistyAnimationControllerDelegate,
} from "./TwistyAnimationController";

export class TwistyPlayerController {
  animationController: TwistyAnimationController;

  constructor(
    private model: TwistyPlayerModel,
    delegate: TwistyAnimationControllerDelegate,
  ) {
    this.animationController = new TwistyAnimationController(model, delegate);
  }

  jumpToStart(options?: { flash: boolean }): void {
    this.animationController.jumpToStart(options);
  }

  jumpToEnd(options?: { flash: boolean }): void {
    this.animationController.jumpToEnd(options);
  }

  togglePlay(play?: boolean) {
    if (typeof play === "undefined") {
      this.animationController.playPause();
    }
    play ? this.animationController.play() : this.animationController.pause();
  }

  public async visitTwizzleLink(): Promise<void> {
    const a = document.createElement("a");
    a.href = await this.model.twizzleLink();
    a.target = "_blank";
    a.click();
  }
}
