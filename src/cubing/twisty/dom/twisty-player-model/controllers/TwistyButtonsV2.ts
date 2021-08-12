import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
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
  buttons: Record<ButtonCommand, HTMLButtonElement> | null = null;

  // TODO: Privacy
  constructor(
    public model?: TwistyPlayerModel,
    public controller?: TwistyPlayerController,
  ) {
    super();
    console.log({ model, controller });
  }

  connectedCallback(): void {
    const buttons: Partial<Record<ButtonCommand, HTMLButtonElement>> = {};
    for (const command in buttonCommands) {
      const button = document.createElement("button");
      button.textContent = command;
      buttons[command as ButtonCommand] = button;
      button.addEventListener("click", () =>
        this.#onCommand(command as ButtonCommand),
      );
      this.addElement(button);
    }
    this.buttons = buttons as Record<ButtonCommand, HTMLButtonElement>;

    this.model?.buttonAppearanceProp.addListener(() => this.update(), {
      initial: true,
    });
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
        console.log("play-pause!", this.controller);
        this.controller?.playPause();
        break;
      case "play-step":
        break;
      case "jump-to-end":
        this.controller?.jumpToEnd();
        break;
      case "twizzle-link":
        break;
      default:
        throw new Error("Missing command");
    }
  }

  async update(): Promise<void> {
    const buttonAppearances = await this.model!.buttonAppearanceProp.get();
    // TODO: Check that we have every command?
    for (const command in buttonCommands) {
      // TODO: Why doesn't `command` have the type `ButtonCommand`?
      const button = this.buttons![command as ButtonCommand];
      // TODO: track individual changes?
      const info = buttonAppearances[command as ButtonCommand];
      button.disabled = !info.enabled;
      button.title = info.title;
      button.textContent = info.icon;
    }
  }
}

customElementsShim.define("twisty-buttons-v2", TwistyButtonsV2);
