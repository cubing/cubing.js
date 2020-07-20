// <twisty-scrubber>

import {
  MillisecondTimestamp,
  Timeline,
  TimelineTimestampListener,
} from "../../animation/Timeline";
import { TwistyControlElement } from "./TwistyControlElement.ts";
import { CSSManager } from "../CSSManager";
import { twistyScrubberCSS } from "./TwistyScrubber.css";

// Usually a horizontal line.
export class TwistyScrubber extends HTMLElement
  implements TwistyControlElement, TimelineTimestampListener {
  #shadow: ShadowRoot;
  #wrapper: HTMLDivElement = document.createElement("div");
  #cssManager: CSSManager;

  range: HTMLInputElement = document.createElement("input"); // type="range"
  constructor(private timeline?: Timeline) {
    super();

    this.#shadow = this.attachShadow({ mode: "closed" });
    this.#wrapper.classList.add("wrapper");
    this.#shadow.appendChild(this.#wrapper);

    this.#cssManager = new CSSManager(this.#shadow);
    this.#cssManager.addSource(twistyScrubberCSS);

    this.timeline!.addTimestampListener(this);
    this.range.type = "range";

    this.range.step = (1).toString();
    this.range.min = this.timeline!.minTimeStamp().toString();
    this.range.max = this.timeline!.maxTimeStamp().toString();

    this.#wrapper.appendChild(this.range);
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
