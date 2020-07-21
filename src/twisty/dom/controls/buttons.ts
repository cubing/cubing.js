import {
  Timeline,
  TimelineActionEvent,
  TimestampLocationType,
  TimelineAction,
} from "../../animation/Timeline";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { buttonCSS, buttonGridCSS } from "./buttons.css";
import { TwistyControlElement } from "./TwistyControlElement.ts";

type TimelineCommand =
  | "fullscreen"
  | "jump-to-start"
  | "play-pause" // TODO: toggle-play?
  // | "play"
  // | "play-backwards"
  | "play-step"
  | "play-step-backwards"
  | "jump-to-end";

class TwistyControlButton extends ManagedCustomElement
  implements TwistyControlElement {
  private timeline: Timeline;
  private timelineCommand: TimelineCommand;
  protected button: HTMLButtonElement = document.createElement("button");
  constructor(
    timeline?: Timeline,
    timelineCommand?: TimelineCommand,
    private fullscreenElement?: Element, // TODO: reflect as an element attribute?
  ) {
    super();

    if (!timeline) {
      console.log("Must have timeline!"); // TODO
    }
    this.timeline = timeline!;
    if (!timelineCommand) {
      console.log("Must have timelineCommand!"); // TODO
    }
    this.timelineCommand = timelineCommand!;

    this.addCSS(buttonCSS);
    this.button.textContent = this.label();
    this.addElement(this.button);
    this.addEventListener("click", this.onPress.bind(this));

    switch (this.timelineCommand!) {
      case "play-step":
      case "play-step-backwards":
        this.button.disabled = true;
        break;
    }

    this.timeline!.addActionListener(this);
  }

  private label(): string {
    const map: Record<TimelineCommand, string> = {
      "jump-to-start": "⏮",
      "play-pause": "▶️",
      "play-step": "⃕",
      "play-step-backwards": "⃔",
      "jump-to-end": "⏭",
      "fullscreen": "🖥",
    };
    return map[this.timelineCommand];
  }

  onPress(): void {
    switch (this.timelineCommand!) {
      case "fullscreen":
        if (document.fullscreenElement === this.fullscreenElement) {
          document.exitFullscreen();
        } else {
          this.fullscreenElement!.requestFullscreen();
        }
        break;
      case "jump-to-start":
        this.timeline.setTimestamp(0);
        break;
      case "jump-to-end":
        this.timeline.jumpToEnd();
        break;
      case "play-pause":
        this.timeline.playPause();
        break;
      case "play-step":
        throw new Error("Unimplemented");
      case "play-step-backwards":
        throw new Error("Unimplemented");
    }
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    switch (this.timelineCommand!) {
      case "jump-to-start":
        this.button.disabled =
          actionEvent.locationType === TimestampLocationType.StartOfTimeline &&
          actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "jump-to-end":
        this.button.disabled =
          actionEvent.locationType === TimestampLocationType.EndOfTimeline;
        break;
      case "play-pause":
        // Always enabled, since we will jump to the start if needed.
        switch (actionEvent.action) {
          case TimelineAction.Pausing:
            this.button.textContent = "▶️";
            break;
          case TimelineAction.StartingToPlay:
            this.button.textContent = "⏸";
            break;
          // TODO: does jumping mean pause?
        }
        break;
      case "play-step":
        // TODO
        // this.button.disabled =
        //   actionEvent.locationType === TimestampLocationType.EndOfTimeline;
        break;
      case "play-step-backwards":
        // TODO
        // this.button.disabled =
        //   actionEvent.locationType === TimestampLocationType.StartOfTimeline &&
        //   actionEvent.action !== TimelineAction.StartingToPlay;
        break;
    }
  }
}

if (customElements) {
  customElements.define("twisty-control-button", TwistyControlButton);
}

// <twisty-control-button-grid>
// Usually a horizontal line.
export class TwistyControlButtonPanel extends ManagedCustomElement
  implements TwistyControlElement {
  constructor(timeline?: Timeline, fullscreenElement?: Element) {
    super();
    this.addCSS(buttonGridCSS);

    // this.addElement(new TwistyControlButton(timeline!, fullscreenElement!));
    this.addElement(
      new TwistyControlButton(timeline!, "fullscreen", fullscreenElement),
    );
    this.addElement(new TwistyControlButton(timeline!, "jump-to-start"));
    this.addElement(new TwistyControlButton(timeline!, "play-step-backwards"));
    this.addElement(new TwistyControlButton(timeline!, "play-pause"));
    this.addElement(new TwistyControlButton(timeline!, "play-step"));
    this.addElement(new TwistyControlButton(timeline!, "jump-to-end"));
    /*...*/
  }
}

if (customElements) {
  customElements.define(
    "twisty-control-button-panel",
    TwistyControlButtonPanel,
  );
}
