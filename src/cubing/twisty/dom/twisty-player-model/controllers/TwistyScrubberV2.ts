import type { TimeRange } from "../../../animation/cursor/AlgCursor";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { EffectiveTimestamp } from "../props/depth-6/EffectiveTimestamp";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";

const SLOW_DOWN_SCRUBBING = false;

var isMouseDown = false;

document.addEventListener(
  "mousedown",
  function (event) {
    if (event.which) isMouseDown = true;
  },
  true,
);

document.addEventListener(
  "mouseup",
  function (event) {
    if (event.which) isMouseDown = false;
  },
  true,
);

// var x = 0;
var y = 0;
let clickNum = 0;

document.addEventListener(
  "mousedown",
  () => {
    clickNum++;
  },
  false,
);

document.addEventListener("mousemove", onMouseUpdate, false);
document.addEventListener("mouseenter", onMouseUpdate, false);

function onMouseUpdate(e: MouseEvent) {
  // x = e.pageX;
  y = e.pageY;
  // console.log(x, y);
}

let lastVal = 0;
let lastPreval = 0;
let scaling: boolean = false;
let currentClickNum = 0;

// Values are integers.
export class TwistyScrubberV2 extends ManagedCustomElement {
  constructor(public model?: TwistyPlayerModel) {
    super();
  }

  #latestTimeRangePromise: Promise<TimeRange> | null = null;
  async onTimeRange(): Promise<void> {
    // console.log("tr onTimeRange");
    if (this.model) {
      // const rand = Math.random();
      const promise = this.model.timeRangeProp.get();
      this.#latestTimeRangePromise = promise;
      const timeRange = await promise;
      // console.log("tr onTimeRange timeRange", timeRange, rand);
      const inputElem = await this.inputElem();
      if (this.#latestTimeRangePromise !== promise) {
        // console.log("tr skipping!", rand);
        return;
      }
      // console.log("tr setting!", timeRange);
      inputElem.min = timeRange.start.toString();
      inputElem.max = timeRange.end.toString();

      // this.onTimestamp(); // TODO
    }
  }

  #latestTimestampPromise: Promise<EffectiveTimestamp> | null = null;
  async onTimestamp(): Promise<void> {
    // const rand = Math.random();
    // console.log("ts onTimestamp rand", rand);
    if (this.model) {
      const timestampPromise = this.model.effectiveTimestampProp.get();
      this.#latestTimestampPromise = timestampPromise;
      const timestamp = (await timestampPromise).timestamp;
      const inputElem = await this.inputElem();
      if (this.#latestTimestampPromise !== timestampPromise) {
        // console.log("ts skipping!", rand);
        return;
      }
      // console.log("ts setting", timestamp);
      inputElem.value = timestamp.toString();
    }
  }

  async connectedCallback(): Promise<void> {
    this.addElement(await this.inputElem());
  }

  #inputElem: Promise<HTMLInputElement> | null = null;
  async inputElem(): Promise<HTMLInputElement> {
    return (this.#inputElem ??= (async () => {
      const elem = document.createElement("input");
      elem.type = "range";

      this.model?.timeRangeProp.addListener(this.onTimeRange.bind(this), {
        initial: true,
      });
      this.model?.effectiveTimestampProp.addListener(
        this.onTimestamp.bind(this),
        {
          initial: true,
        },
      );

      elem.addEventListener("input", this.onInput.bind(this));

      return elem;
    })());
  }

  async onInput(e: Event): Promise<void> {
    if (scaling) {
      return; // TODO
    }
    const inputElem = await this.inputElem();
    await this.slowDown(e, inputElem); // TODO

    const value = parseInt(inputElem.value);
    console.log("on input", value);
    this.model?.timestampRequestProp.set(value);
  }

  async slowDown(e: Event, inputElem: HTMLInputElement): Promise<void> {
    if (!SLOW_DOWN_SCRUBBING) {
      return; // TODO
    }

    if (isMouseDown) {
      const rect = inputElem.getBoundingClientRect();
      const sliderY = rect.top + rect.height / 2;
      console.log(sliderY, e, y, isMouseDown);

      const yDist = Math.abs(sliderY - y);
      let scale = 1;
      if (yDist > 64) {
        scale = Math.max(Math.pow(2, -(yDist - 64) / 64), 1 / 32);
      }
      const preVal = parseInt(inputElem.value);
      console.log("cl", currentClickNum, clickNum, preVal);
      if (currentClickNum === clickNum) {
        const delta = (preVal - lastPreval) * scale;
        console.log("delta", delta, yDist);
        scaling = true;
        let newVal = preVal;
        newVal =
          lastVal +
          delta * scale +
          (preVal - lastVal) *
            Math.min(1, Math.pow(1 / 2, (yDist * yDist) / 64));
        inputElem.value = newVal.toString();
        console.log(scale);
        scaling = false;
        this.contentWrapper.style.opacity = scale.toString();
      } else {
        currentClickNum = clickNum;
      }
      lastPreval = preVal;
    }
  }
}

customElementsShim.define("twisty-scrubber-v2", TwistyScrubberV2);
