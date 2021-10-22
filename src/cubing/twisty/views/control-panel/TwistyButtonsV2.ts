import {
  BoundaryType,
  Direction,
} from "../../old/animation/cursor/CursorTypes";
import { buttonCSS, buttonGridCSS } from "../../old/dom/controls/buttons.css";
import { ClassListManager } from "../../old/dom/element/ClassListManager";
import { ManagedCustomElement } from "../../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../../old/dom/element/node-custom-element-shims";
import {
  ButtonAppearances,
  ButtonIcon,
  buttonIcons,
} from "../../model/depth-9/ButtonAppearanceProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import type { TwistyPlayerController } from "../../controllers/TwistyPlayerController";
import {
  documentExitFullscreen,
  documentFullscreenElement,
  requestFullscreen,
} from "./webkit-fullscreen";

const buttonCommands = {
  "fullscreen": true,
  "jump-to-start": true,
  "play-step-backwards": true,
  "play-pause": true,
  "play-step": true,
  "jump-to-end": true,
  "twizzle-link": true,
};

export type ButtonCommand = keyof typeof buttonCommands;

export class TwistyButtonsV2 extends ManagedCustomElement {
  buttons: Record<ButtonCommand, TwistyButtonV2> | null = null;

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
    const buttons: Partial<Record<ButtonCommand, TwistyButtonV2>> = {};
    for (const command in buttonCommands) {
      const button = new TwistyButtonV2();
      buttons[command as ButtonCommand] = button;
      // Why does this still fire with the `disabled` attribute?
      button.addEventListener("click", () =>
        this.#onCommand(command as ButtonCommand),
      );
      this.addElement(button);
    }
    this.buttons = buttons as Record<ButtonCommand, TwistyButtonV2>;

    this.model?.buttonAppearanceProp.addFreshListener(this.update.bind(this));
  }

  #onCommand(command: ButtonCommand) {
    switch (command) {
      case "fullscreen":
        this.onFullscreenButton();
        break;
      case "jump-to-start":
        this.controller?.jumpToStart({ flash: true });
        break;
      case "play-step-backwards":
        this.controller?.animationController.play({
          direction: Direction.Backwards,
          untilBoundary: BoundaryType.Move,
        });
        break;
      case "play-pause":
        this.controller?.togglePlay();
        break;
      case "play-step":
        this.controller?.animationController.play({
          direction: Direction.Forwards,
          untilBoundary: BoundaryType.Move,
        });
        break;
      case "jump-to-end":
        this.controller?.jumpToEnd({ flash: true });
        break;
      case "twizzle-link":
        this.controller?.visitTwizzleLink();
        break;
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
      button.button.disabled = !info.enabled;
      button.button.title = info.title;
      button.setIcon(info.icon);
      button.hidden = !!info.hidden;
      // button.textContent = info.icon;
    }
  }
}

customElementsShim.define("twisty-buttons-v2", TwistyButtonsV2);

class TwistyButtonV2 extends ManagedCustomElement {
  button: HTMLButtonElement = document.createElement("button"); // TODO: async?

  connectedCallback() {
    this.addCSS(buttonCSS);
    this.addElement(this.button);
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

customElementsShim.define("twisty-button-v2", TwistyButtonV2);
