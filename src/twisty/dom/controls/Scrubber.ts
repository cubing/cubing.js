// <twisty-scrubber>

import {
  MillisecondTimestamp,
  Timeline,
  TimelineTimestampListener,
} from "../../animation/Timeline";
import { TwistyControlElement } from "./TwistyControlElement.ts";

// Usually a horizontal line.
export class Scrubber extends HTMLElement
  implements TwistyControlElement, TimelineTimestampListener {
  range: HTMLInputElement; // type="range"
  constructor(private timeline: Timeline) {
    super();
    this.timeline.addTimestampListener(this);
    /*...*/
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void {
    // Update slider position.
    /*...*/
  }
}
