// <twisty-scrubber>

import type { TimeRange } from "../../animation/cursor/AlgCursor";
import type { MillisecondTimestamp } from "../../animation/cursor/CursorTypes";
import type {
  Timeline,
  TimelineTimestampListener,
} from "../../animation/Timeline";
import { ManagedCustomElement } from "../../../views/ManagedCustomElement";
import { customElementsShim } from "../../../views/node-custom-element-shims";
import type { TwistyControlElement } from "./TwistyControlElement";
import { twistyScrubberCSS } from "./TwistyScrubber.css";

// Usually a horizontal line.
export class TwistyScrubber
  extends ManagedCustomElement
  implements TwistyControlElement, TimelineTimestampListener
{
  private timeline: Timeline;
  range: HTMLInputElement = document.createElement("input"); // type="range"
  constructor(timeline?: Timeline) {
    super();
    this.timeline = timeline!; // TODO

    this.addCSS(twistyScrubberCSS);

    this.timeline?.addTimestampListener(this); // TODO
    this.range.type = "range";

    this.range.step = (1).toString();
    this.range.min = this.timeline?.minTimestamp().toString(); // TODO
    this.range.max = this.timeline?.maxTimestamp().toString(); // TODO
    this.range.value = this.timeline?.timestamp.toString(); // TODO
    this.range.addEventListener("input", this.onInput.bind(this));

    this.addElement(this.range);
  }

  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void {
    this.range.value = timestamp.toString();
  }

  onTimeRangeChange(timeRange: TimeRange): void {
    this.range.min = timeRange.start.toString();
    this.range.max = timeRange.end.toString();
  }

  private onInput(): void {
    this.timeline.setTimestamp(parseInt(this.range.value, 10));
  }
}

customElementsShim.define("twisty-scrubber", TwistyScrubber);
