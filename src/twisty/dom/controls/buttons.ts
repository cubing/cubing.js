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
  constructor(timeline: Timeline, fullscreenElement: Element) {
    super();
    this.appendChild(
      new TwistyControlButtonFullscreen(timeline, fullscreenElement),
    );
    this.appendChild(new TwistyControlButtonJumpToStart(timeline));
    /*...*/
  }
}

export class TwistyControlButtonFullscreen extends TwistyControlButton {
  constructor(
    protected timeline: Timeline,
    private fullscreenElement: Element,
  ) {
    super();
    /*...*/
  }

  onPress(): void {
    this.fullscreenElement.requestFullscreen();
  }
}

export class TwistyControlButtonJumpToStart extends TwistyControlButton
  implements TimelineActionListener {
  constructor(protected timeline: Timeline) {
    super();
    /*...*/
    timeline.addActionListener(this);
  }

  onPress(): void {
    this.timeline.setTimestamp(0);
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    this.disabled =
      actionEvent.locationType === TimestampLocationType.StartOfTimeline;
  }
}

export class TwistyControlButtonPlay extends TwistyControlButton {
  constructor(protected timeline: Timeline) {
    super();
    /*...*/
    timeline.addActionListener(this);
  }

  onPress(): void {
    this.timeline.setTimestamp(0);
  }

  onTimelineAction(actionEvent: TimelineActionEvent): void {
    this.disabled = actionEvent.action === TimelineAction.Pausing;
  }
}
