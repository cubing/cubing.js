import {
  Timeline,
  TimelineAction,
  TimelineActionEvent,
  TimelineActionListener,
  TimestampLocationType,
} from "../../animation/Timeline";
import { CustomElementManager } from "../ManagedCustomElement";
import { TwistyControlElement } from "./TwistyControlElement.ts";

abstract class TwistyControlButton extends HTMLButtonElement
  implements TwistyControlElement {
  constructor() {
    super();
  }
}

// <twisty-control-button-grid>
// Usually a horizontal line.
export class TwistyControlButtonGrid extends HTMLElement
  implements TwistyControlElement {
  #manager: CustomElementManager;
  constructor(timeline?: Timeline, fullscreenElement?: Element) {
    super();
    this.#manager = new CustomElementManager(
      this.attachShadow.call(this, {
        mode: "closed",
      }),
    ); // TODO: open???);

    this.appendChild(
      new TwistyControlButtonFullscreen(timeline!, fullscreenElement!),
    );
    this.appendChild(new TwistyControlButtonJumpToStart(timeline!));
    /*...*/
  }
}

if (customElements) {
  customElements.define("twisty-control-button-grid", TwistyControlButtonGrid);
}

export class TwistyControlButtonFullscreen extends HTMLElement {
  #manager: CustomElementManager;
  constructor(
    protected timeline?: Timeline,
    private fullscreenElement?: Element,
  ) {
    super();
    this.#manager = new CustomElementManager(
      this.attachShadow.call(this, {
        mode: "closed",
      }),
    ); // TODO: open???);

    /*...*/
    this.textContent = "🖥";
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

export class TwistyControlButtonJumpToStart extends HTMLElement
  implements TimelineActionListener {
  #shadow: ShadowRoot;
  #wrapper: HTMLDivElement = document.createElement("div");
  // #cssManager: CSSManager;
  private button: HTMLButtonElement = document.createElement("button");
  constructor(protected timeline?: Timeline) {
    super();

    this.#shadow = this.attachShadow({ mode: "closed" });
    this.#wrapper.classList.add("wrapper");
    this.#shadow.appendChild(this.#wrapper);
    /*...*/
    this.timeline!.addActionListener(this);
    this.textContent = "⏮";
  }

  connectedCallback(): void {
    console.log(this, this.#wrapper);
    this.#wrapper.appendChild(this.button);
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
  constructor(protected timeline?: Timeline) {
    super();
    /*...*/
    this.timeline!.addActionListener(this);
    this.textContent = "▶️";
  }

  onPress(): void {
    this.timeline!.setTimestamp(0);
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    this.disabled = actionEvent.action === TimelineAction.Pausing;
  }
}

if (customElements) {
  customElements.define("twisty-control-button-play", TwistyControlButtonPlay);
}
