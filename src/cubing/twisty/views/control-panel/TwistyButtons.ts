import { BoundaryType, Direction } from "../../controllers/AnimationTypes.ts";
import type { TwistyPlayerController } from "../../controllers/TwistyPlayerController.ts";
import {
  type ButtonAppearances,
  type ButtonIcon,
  buttonIcons,
} from "../../model/props/viewer/ButtonAppearanceProp.ts";
import type { ColorScheme } from "../../model/props/viewer/ColorSchemeRequestProp.ts";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel.ts";
import { ClassListManager } from "../ClassListManager.ts";
import { ManagedCustomElement } from "../ManagedCustomElement.ts";
import { customElementsShim } from "../node-custom-element-shims.ts";
import { buttonCSS, buttonGridCSS } from "./TwistyButtons.css.ts";
import {
  documentExitFullscreen,
  documentFullscreenElement,
  requestFullscreen,
} from "./webkit-fullscreen.ts";

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

  public model?: TwistyPlayerModel;
  public controller?: TwistyPlayerController;
  private defaultFullscreenElement?: HTMLElement;

  // TODO: Privacy
  constructor(
    model?: TwistyPlayerModel,
    controller?: TwistyPlayerController,
    defaultFullscreenElement?: HTMLElement,
  ) {
    super();
    this.model = model;
    this.controller = controller;
    this.defaultFullscreenElement = defaultFullscreenElement;
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
    this.model?.twistySceneModel.colorScheme.addFreshListener(
      this.updateColorScheme.bind(this),
    );
  }

  #onCommand(command: ButtonCommand) {
    switch (command) {
      case "fullscreen": {
        void this.onFullscreenButton();
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
        void this.controller?.visitTwizzleLink();
        break;
      }
      default:
        throw new Error("Missing command");
    }
  }

  // TODO: Should we have a prop, or a way to query if we're fullscreen?
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen
  async onFullscreenButton(): Promise<void> {
    if (!this.defaultFullscreenElement) {
      throw new Error("Attempted to go fullscreen without an element.");
    }

    if (documentFullscreenElement() === this.defaultFullscreenElement) {
      void documentExitFullscreen();
    } else {
      // TODO: Propagate button info to `ButtonAppearanceProp`.
      this.buttons?.fullscreen.setIcon("exit-fullscreen");

      void requestFullscreen(
        (await this.model?.twistySceneModel.fullscreenElement.get()) ??
          this.defaultFullscreenElement,
      );

      const onFullscreen = (): void => {
        if (documentFullscreenElement() !== this.defaultFullscreenElement) {
          this.buttons?.fullscreen.setIcon("enter-fullscreen");
          globalThis.removeEventListener("fullscreenchange", onFullscreen);
        }
      };
      globalThis.addEventListener("fullscreenchange", onFullscreen);
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

  updateColorScheme(colorScheme: ColorScheme): void {
    for (const button of Object.values(this.buttons ?? {})) {
      button.updateColorScheme(colorScheme);
    }
  }
}

customElementsShim.define("twisty-buttons", TwistyButtons);

class TwistyButton extends ManagedCustomElement {
  htmlButton: HTMLButtonElement = document.createElement("button"); // TODO: async?

  updateColorScheme(colorScheme: ColorScheme): void {
    this.contentWrapper.classList.toggle("dark-mode", colorScheme === "dark");
  }

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
