import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";
import {
  TwistyAnimationController,
  TwistyAnimationControllerDelegate,
} from "./TwistyAnimationController";

export class TwistyPlayerController {
  animationController: TwistyAnimationController;

  constructor(
    private model: TwistyPlayerModel,
    delegate: TwistyAnimationControllerDelegate,
  ) {
    this.animationController = new TwistyAnimationController(model, delegate);
  }

  jumpToStart(): void {
    this.animationController.jumpToStart();
  }

  jumpToEnd(): void {
    this.animationController.jumpToEnd();
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
