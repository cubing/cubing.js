import {
  Timeline,
  TimelineActionEvent,
  TimestampLocationType,
  TimelineAction,
  MillisecondTimestamp,
} from "../../animation/Timeline";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { buttonCSS, buttonGridCSS } from "./buttons.css";
import { TwistyControlElement } from "./TwistyControlElement.ts";
import { TimeRange } from "../../animation/alg/AlgCursor";
import { Direction, BoundaryType } from "../../animation/alg/CursorTypes";
import { customElementsShim } from "../element/node-custom-element-shims";

type TimelineCommand =
  | "fullscreen"
  | "jump-to-start"
  | "play-pause" // TODO: toggle-play?
  // | "play"
  // | "play-backwards"
  | "play-step-backwards"
  | "play-step"
  | "jump-to-end";

// TODO: combine this with disabled status and label in a state machine?
type ButtonIconName =
  | "skip-to-start"
  | "skip-to-end"
  | "step-forward"
  | "step-backward"
  | "pause"
  | "play"
  | "enter-fullscreen"
  | "exit-fullscreen";

class TwistyControlButton extends ManagedCustomElement
  implements TwistyControlElement {
  private timeline: Timeline;
  private timelineCommand: TimelineCommand;
  private currentIconName: string | null = null;
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
    this.setIcon(this.initialIcon());
    this.setHoverTitle(this.initialHoverTitle());
    this.addElement(this.button);
    this.addEventListener("click", this.onPress.bind(this));

    switch (this.timelineCommand!) {
      case "fullscreen":
        if (!document.fullscreenEnabled) {
          this.button.disabled = true;
        }
        break;
      case "jump-to-start":
      case "play-step-backwards":
        this.button.disabled = true;
        break;
    }

    this.timeline!.addActionListener(this);
    switch (this.timelineCommand!) {
      case "play-pause":
      case "play-step-backwards":
      case "play-step":
        this.timeline!.addTimestampListener(this);
        break;
    }

    this.autoSetTimelineBasedDisabled();
  }

  // TODO: Can we avoid duplicate calculations?
  private autoSetTimelineBasedDisabled(): void {
    switch (this.timelineCommand!) {
      case "jump-to-start":
      case "play-pause":
      case "play-step-backwards":
      case "play-step":
      case "jump-to-end": {
        const timeRange = this.timeline.timeRange();
        if (timeRange.start === timeRange.end) {
          this.button.disabled = true;
          return;
        }
        switch (this.timelineCommand!) {
          case "jump-to-start":
          case "play-step-backwards":
            this.button.disabled =
              this.timeline.timestamp < this.timeline.maxTimestamp();
            break;
          case "jump-to-end":
          case "play-step":
            this.button.disabled =
              this.timeline.timestamp > this.timeline.minTimestamp();
            break;
          default:
            this.button.disabled = false;
        }
        break;
      }
    }
  }

  setIcon(buttonIconName: ButtonIconName): void {
    if (this.currentIconName === buttonIconName) {
      return;
    }
    if (this.currentIconName) {
      this.button.classList.remove(`svg-${this.currentIconName}`);
    }
    this.button.classList.add(`svg-${buttonIconName}`);
    this.currentIconName = buttonIconName;
  }

  private initialIcon(): ButtonIconName {
    const map: Record<TimelineCommand, ButtonIconName> = {
      "jump-to-start": "skip-to-start",
      "play-pause": "play",
      "play-step": "step-forward",
      "play-step-backwards": "step-backward",
      "jump-to-end": "skip-to-end",
      "fullscreen": "enter-fullscreen",
    };
    return map[this.timelineCommand];
  }

  private initialHoverTitle(): string {
    const map: Record<TimelineCommand, string> = {
      "jump-to-start": "Restart",
      "play-pause": "Play",
      "play-step": "Step forward",
      "play-step-backwards": "Step backward",
      "jump-to-end": "Skip to End",
      "fullscreen": "Enter fullscreen",
    };
    return map[this.timelineCommand];
  }

  private setHoverTitle(title: string): void {
    this.button.title = title;
  }

  onPress(): void {
    switch (this.timelineCommand!) {
      case "fullscreen":
        if (document.fullscreenElement === this.fullscreenElement) {
          document.exitFullscreen();
          // this.setIcon("enter-fullscreen");
        } else {
          this.setIcon("exit-fullscreen");
          this.fullscreenElement!.requestFullscreen().then(() => {
            const onFullscreen = (): void => {
              if (document.fullscreenElement !== this.fullscreenElement) {
                this.setIcon("enter-fullscreen");
                window.removeEventListener("fullscreenchange", onFullscreen);
              }
            };
            window.addEventListener("fullscreenchange", onFullscreen);
          });
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
        this.timeline.experimentalPlay(Direction.Forwards, BoundaryType.Move);
        break;
      case "play-step-backwards":
        this.timeline.experimentalPlay(Direction.Backwards, BoundaryType.Move);
        break;
    }
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    switch (this.timelineCommand!) {
      case "jump-to-start":
        // TODO: what if you're already playing?
        this.button.disabled =
          actionEvent.locationType === TimestampLocationType.StartOfTimeline &&
          actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "jump-to-end":
        this.button.disabled =
          actionEvent.locationType === TimestampLocationType.EndOfTimeline &&
          actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "play-pause":
        // Always enabled, since we will jump to the start if needed.
        switch (actionEvent.action) {
          case TimelineAction.Pausing:
            this.setIcon("play");
            this.setHoverTitle("Play");
            break;
          case TimelineAction.StartingToPlay:
            this.setIcon("pause");
            this.setHoverTitle("Pause");
            break;
          // TODO: does jumping mean pause?
        }
        break;
      case "play-step":
        // TODO: refine this
        this.button.disabled =
          actionEvent.locationType === TimestampLocationType.EndOfTimeline &&
          actionEvent.action !== TimelineAction.StartingToPlay;
        break;
      case "play-step-backwards":
        // TODO: refine this
        this.button.disabled =
          actionEvent.locationType === TimestampLocationType.StartOfTimeline &&
          actionEvent.action !== TimelineAction.StartingToPlay;
        break;
    }
  }

  onTimelineTimestampChange(_timestamp: MillisecondTimestamp): void {
    // Nothing
  }

  onTimeRangeChange(_timeRange: TimeRange): void {
    // TODO
    this.autoSetTimelineBasedDisabled();
  }
}

customElementsShim.define("twisty-control-button", TwistyControlButton);

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

customElementsShim.define(
  "twisty-control-button-panel",
  TwistyControlButtonPanel,
);
