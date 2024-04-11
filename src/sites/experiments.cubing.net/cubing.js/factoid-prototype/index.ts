import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";
import { BoundaryType } from "../../../../cubing/twisty/controllers/AnimationTypes";

class FactoidSection extends HTMLElement {
  twistyPlayer: TwistyPlayer;
  continueButton: HTMLButtonElement;
  currentFactoidElem: HTMLDivElement;
  constructor() {
    super();
    this.twistyPlayer = this.querySelector("twisty-player")!;
    this.continueButton = this.querySelector<HTMLButtonElement>(".continue")!;

    this.currentFactoidElem =
      this.querySelector<HTMLDivElement>(".factoids > div")!;
    this.continueButton.addEventListener("click", () => this.continue());
  }

  async continue() {
    this.continueButton.disabled = true;
    this.twistyPlayer.controller.animationController.play({
      untilBoundary: BoundaryType.Move,
    });

    this.currentFactoidElem.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 500,
      easing: "ease-in-out",
      fill: "forwards",
    });

    await new Promise((resolve) => setTimeout(resolve, 500));
    this.currentFactoidElem.hidden = true;
    const nextFactoidElem = this.currentFactoidElem
      .nextElementSibling as HTMLDivElement | null;
    if (!nextFactoidElem) {
      return;
    }
    this.currentFactoidElem = nextFactoidElem;
    this.currentFactoidElem.hidden = false;
    this.currentFactoidElem.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 1000,
      easing: "ease-in-out",
    });

    this.currentFactoidElem.hidden = false;

    setTimeout(() => {
      this.continueButton.disabled = false;
      this.continueButton.focus();
    }, 1000);
  }
}

customElements.define("factoid-section", FactoidSection);
