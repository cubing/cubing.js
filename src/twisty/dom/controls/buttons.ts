import {
  Timeline,
  TimelineAction,
  TimelineActionEvent,
  TimelineActionListener,
  TimestampLocationType,
} from "../../animation/Timeline";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { TwistyControlElement } from "./TwistyControlElement.ts";
import { buttonGridCSS, buttonCSS } from "./buttons.css";

abstract class TwistyControlButton extends ManagedCustomElement
  implements TwistyControlElement {
  constructor() {
    super();
  }
}

// <twisty-control-button-grid>
// Usually a horizontal line.
export class TwistyControlButtonGrid extends ManagedCustomElement
  implements TwistyControlElement {
  constructor(timeline?: Timeline, fullscreenElement?: Element) {
    super();
    this.addCSS(buttonGridCSS);

    this.addElement(
      new TwistyControlButtonFullscreen(timeline!, fullscreenElement!),
    );
    this.addElement(new TwistyControlButtonJumpToStart(timeline!));
    /*...*/
  }
}

if (customElements) {
  customElements.define("twisty-control-button-grid", TwistyControlButtonGrid);
}

export class TwistyControlButtonFullscreen extends ManagedCustomElement {
  private button: HTMLButtonElement = document.createElement("button");
  constructor(
    protected timeline?: Timeline,
    private fullscreenElement?: Element,
  ) {
    super();
    this.addCSS(buttonCSS);
    /*...*/
    this.button.textContent = "🖥";
    this.addElement(this.button);
    this.addEventListener("click", this.onPress.bind(this));
  }

  onPress(): void {
    if (document.fullscreenElement === this.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.fullscreenElement!.requestFullscreen();
    }
  }
}

if (customElements) {
  customElements.define(
    "twisty-control-button-fullscreen",
    TwistyControlButtonFullscreen,
  );
}

export class TwistyControlButtonJumpToStart extends ManagedCustomElement
  implements TimelineActionListener {
  private button: HTMLButtonElement = document.createElement("button");
  constructor(protected timeline?: Timeline) {
    super();
    this.addCSS(buttonCSS);
    /*...*/
    this.timeline!.addActionListener(this);
    this.button.textContent = "⏮";
    this.addElement(this.button);
  }

  connectedCallback(): void {
    console.log(this, this.contentWrapper);
    this.contentWrapper.appendChild(this.button);
  }

  onPress(): void {
    this.timeline!.setTimestamp(0);
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    this.button.disabled =
      actionEvent.locationType === TimestampLocationType.StartOfTimeline;
  }
}

if (customElements) {
  customElements.define(
    "twisty-control-button-jump-to-start",
    TwistyControlButtonJumpToStart,
    // { extends: "button" }, // TODO: This doesn't work in Safari.
  );
}

export class TwistyControlButtonPlay extends TwistyControlButton {
  button: HTMLButtonElement = document.createElement("button");
  constructor(protected timeline?: Timeline) {
    super();
    this.addCSS(buttonCSS);
    /*...*/
    this.timeline!.addActionListener(this);
    this.button.textContent = "▶️";
    this.addElement(this.button);
  }

  connectedCallback(): void {
    console.log("sdfsdfsdf");
    this.addElement(this.button);
  }

  onPress(): void {
    this.timeline!.setTimestamp(0);
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    this.button.disabled = actionEvent.action === TimelineAction.Pausing;
  }
}

if (customElements) {
  customElements.define("twisty-control-button-play", TwistyControlButtonPlay);
}
