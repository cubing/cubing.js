// <twisty-scrubber>

import {
  MillisecondTimestamp,
  Timeline,
  TimelineTimestampListener,
} from "../../animation/Timeline";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { TwistyControlElement } from "./TwistyControlElement.ts";
import { twistyScrubberCSS } from "./TwistyScrubber.css";

// Usually a horizontal line.
export class TwistyScrubber extends ManagedCustomElement
  implements TwistyControlElement, TimelineTimestampListener {
  private timeline: Timeline;
  range: HTMLInputElement = document.createElement("input"); // type="range"
  constructor(timeline?: Timeline) {
    super();
    this.timeline = timeline!; // TODO

    this.addCSS(twistyScrubberCSS);

    this.timeline!.addTimestampListener(this);
    this.range.type = "range";

    this.range.step = (1).toString();
    this.range.min = this.timeline!.minTimeStamp().toString();
    this.range.max = this.timeline!.maxTimeStamp().toString();
    this.range.value = this.timeline.timestamp.toString();
    this.range.addEventListener("input", this.onInput.bind(this));

    this.addElement(this.range);
  }

  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void {
    this.range.value = timestamp.toString();
  }

  onInput(): void {
    this.timeline!.setTimestamp(parseInt(this.range.value, 10));
  }
}

if (customElements) {
  customElements.define("twisty-scrubber", TwistyScrubber);
}
