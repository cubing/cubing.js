import {
  Timeline,
  TimelineAction,
  TimelineActionEvent,
  TimelineActionListener,
  TimestampLocationType,
} from "../../animation/Timeline";
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
  constructor(timeline?: Timeline, fullscreenElement?: Element) {
    super();
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

export class TwistyControlButtonFullscreen extends HTMLButtonElement {
  constructor(
    protected timeline?: Timeline,
    private fullscreenElement?: Element,
  ) {
    super();
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
    { extends: "button" },
  );
}

export class TwistyControlButtonJumpToStart extends HTMLButtonElement
  implements TimelineActionListener {
  constructor(protected timeline?: Timeline) {
    super();
    /*...*/
    this.timeline!.addActionListener(this);
    this.textContent = "⏮";
  }

  onPress(): void {
    this.timeline!.setTimestamp(0);
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    this.disabled =
      actionEvent.locationType === TimestampLocationType.StartOfTimeline;
  }
}

if (customElements) {
  customElements.define(
    "twisty-control-button-jump-to-start",
    TwistyControlButtonJumpToStart,
    { extends: "button" },
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
  customElements.define("twisty-control-button-play", TwistyControlButtonPlay, {
    extends: "button",
  });
}
