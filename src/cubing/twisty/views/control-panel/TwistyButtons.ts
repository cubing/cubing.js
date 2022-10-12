import { BoundaryType, Direction } from "../../controllers/AnimationTypes";
import { buttonCSS, buttonGridCSS } from "./TwistyButtons.css";
import { ClassListManager } from "../ClassListManager";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import {
  ButtonAppearances,
  ButtonIcon,
  buttonIcons,
} from "../../model/props/viewer/ButtonAppearanceProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import type { TwistyPlayerController } from "../../controllers/TwistyPlayerController";
import {
  documentExitFullscreen,
  documentFullscreenElement,
  requestFullscreen,
} from "./webkit-fullscreen";

const buttonCommands = {
  fullscreen: true,
  "jump-to-start": true,
  "play-step-backwards": true,
  "play-pause": true,
  "play-step": true,
  "jump-to-end": true,
  "twizzle-link": true,
};

export type ButtonCommand = keyof typeof buttonCommands;

export class TwistyButtons extends ManagedCustomElement {
  buttons: Record<ButtonCommand, TwistyButton> | null = null;

  // TODO: Privacy
  constructor(
    public model?: TwistyPlayerModel,
    public controller?: TwistyPlayerController,
    private fullscreenElement?: HTMLElement,
  ) {
    super();
  }

  connectedCallback(): void {
    this.addCSS(buttonGridCSS);
    const buttons: Partial<Record<ButtonCommand, TwistyButton>> = {};
    for (const command in buttonCommands) {
      const button = new TwistyButton();
      buttons[command as ButtonCommand] = button;
      button.htmlButton.addEventListener("click", () =>
        this.#onCommand(command as ButtonCommand),
      );
      this.addElement(button);
    }
    this.buttons = buttons as Record<ButtonCommand, TwistyButton>;

    this.model?.buttonAppearance.addFreshListener(this.update.bind(this));
  }

  #onCommand(command: ButtonCommand) {
    switch (command) {
      case "fullscreen": {
        this.onFullscreenButton();
        break;
      }
      case "jump-to-start": {
        this.controller?.jumpToStart({ flash: true });
        break;
      }
      case "play-step-backwards": {
        this.controller?.animationController.play({
          direction: Direction.Backwards,
          untilBoundary: BoundaryType.Move,
        });
        break;
      }
      case "play-pause": {
        this.controller?.togglePlay();
        break;
      }
      case "play-step": {
        this.controller?.animationController.play({
          direction: Direction.Forwards,
          untilBoundary: BoundaryType.Move,
        });
        break;
      }
      case "jump-to-end": {
        this.controller?.jumpToEnd({ flash: true });
        break;
      }
      case "twizzle-link": {
        this.controller?.visitTwizzleLink();
        break;
      }
      default:
        throw new Error("Missing command");
    }
  }

  // TODO: Should we have a prop, or a way to query if we're fullscreen?
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen
  async onFullscreenButton(): Promise<void> {
    if (!this.fullscreenElement) {
      throw new Error("Attempted to go fullscreen without an element.");
    }

    if (documentFullscreenElement() === this.fullscreenElement) {
      documentExitFullscreen();
    } else {
      // TODO: Propagate button info to `ButtonAppearanceProp`.
      this.buttons?.fullscreen.setIcon("exit-fullscreen");

      requestFullscreen(this.fullscreenElement);

      const onFullscreen = (): void => {
        if (documentFullscreenElement() !== this.fullscreenElement) {
          this.buttons?.fullscreen.setIcon("enter-fullscreen");
          window.removeEventListener("fullscreenchange", onFullscreen);
        }
      };
      window.addEventListener("fullscreenchange", onFullscreen);
    }
  }

  async update(buttonAppearances: ButtonAppearances): Promise<void> {
    // TODO: Check that we have every command?
    for (const command in buttonCommands) {
      // TODO: Why doesn't `command` have the type `ButtonCommand`?
      const button = this.buttons![command as ButtonCommand];
      // TODO: track individual changes?
      const info = buttonAppearances[command as ButtonCommand];
      button.htmlButton.disabled = !info.enabled;
      button.htmlButton.title = info.title;
      button.setIcon(info.icon);
      button.hidden = !!info.hidden;
      // button.textContent = info.icon;
    }
  }
}

customElementsShim.define("twisty-buttons", TwistyButtons);

class TwistyButton extends ManagedCustomElement {
  htmlButton: HTMLButtonElement = document.createElement("button"); // TODO: async?

  connectedCallback() {
    this.addCSS(buttonCSS);
    this.addElement(this.htmlButton);
  }

  #iconManager: ClassListManager<ButtonIcon> = new ClassListManager(
    this,
    "svg-",
    buttonIcons,
  );

  setIcon(iconName: ButtonIcon): void {
    this.#iconManager.setValue(iconName);
  }
}

customElementsShim.define("twisty-button", TwistyButton);
