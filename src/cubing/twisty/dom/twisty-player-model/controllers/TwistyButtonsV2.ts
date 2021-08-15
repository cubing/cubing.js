import { buttonCSS, buttonGridCSS } from "../../controls/buttons.css_";
import { ClassListManager } from "../../element/ClassListManager";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import {
  ButtonAppearances,
  ButtonIcon,
  buttonIcons,
} from "../props/depth-8/ButtonAppearanceProp";
import type {
  TwistyPlayerController,
  TwistyPlayerModel,
} from "../props/TwistyPlayerModel";

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
  ) {
    super();
  }

  connectedCallback(): void {
    this.addCSS(buttonGridCSS);
    const buttons: Partial<Record<ButtonCommand, TwistyButtonV2>> = {};
    for (const command in buttonCommands) {
      const button = new TwistyButtonV2();
      buttons[command as ButtonCommand] = button;
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
        break;
      case "jump-to-start":
        this.controller?.jumpToStart();
        break;
      case "play-step-backwards":
        break;
      case "play-pause":
        this.controller?.playPause();
        break;
      case "play-step":
        break;
      case "jump-to-end":
        this.controller?.jumpToEnd();
        break;
      case "twizzle-link":
        this.controller?.visitTwizzleLink();
        break;
      default:
        throw new Error("Missing command");
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
