// <twisty-scrubber>

import {
  MillisecondTimestamp,
  Timeline,
  TimelineTimestampListener,
} from "../../animation/Timeline";
import { CustomElementManager } from "../ManagedCustomElement";
import { TwistyControlElement } from "./TwistyControlElement.ts";
import { twistyScrubberCSS } from "./TwistyScrubber.css";

// Usually a horizontal line.
export class TwistyScrubber extends HTMLElement
  implements TwistyControlElement, TimelineTimestampListener {
  #manager: CustomElementManager;
  range: HTMLInputElement = document.createElement("input"); // type="range"
  constructor(private timeline?: Timeline) {
    super();
    this.#manager = new CustomElementManager(
      this.attachShadow.call(this, {
        mode: "closed",
      }),
    ); // TODO: open???);

    this.#manager.addCSS(twistyScrubberCSS);

    this.timeline!.addTimestampListener(this);
    this.range.type = "range";

    this.range.step = (1).toString();
    this.range.min = this.timeline!.minTimeStamp().toString();
    this.range.max = this.timeline!.maxTimeStamp().toString();

    this.#manager.addElement(this.range);
  }

  connectedCallback(): void {
    //
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  onTimelineTimestampChange(timestamp: MillisecondTimestamp): void {
    // Update slider position.
    /*...*/
  }
}

if (customElements) {
  customElements.define("twisty-scrubber", TwistyScrubber);
}
