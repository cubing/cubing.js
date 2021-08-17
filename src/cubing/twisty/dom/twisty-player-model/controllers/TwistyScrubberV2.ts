import { twistyScrubberCSS } from "../../controls/TwistyScrubber.css_";
import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { DetailedTimelineInfo } from "../props/depth-5/DetailedTimelineInfoProp";
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

  async onDetailedTimelineInfo(
    detailedTimelineInfo: DetailedTimelineInfo,
  ): Promise<void> {
    // TODO: is this efficient enough?
    const inputElem = await this.inputElem();
    inputElem.min = detailedTimelineInfo.timeRange.start.toString();
    inputElem.max = detailedTimelineInfo.timeRange.end.toString();
    inputElem.value = detailedTimelineInfo.timestamp.toString();
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(twistyScrubberCSS);
    this.addElement(await this.inputElem());
  }

  #inputElem: Promise<HTMLInputElement> | null = null;
  async inputElem(): Promise<HTMLInputElement> {
    // console.log("inputElem", this.#inputElem);
    return (this.#inputElem ??= (async () => {
      const elem = document.createElement("input");
      elem.type = "range";

      // console.log("1");
      this.model?.detailedTimelineInfoProp.addFreshListener(
        this.onDetailedTimelineInfo.bind(this),
      );
      // console.log("3");
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
    // console.log("on input", value);
    this.model?.playingProp.set({ playing: false });
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
