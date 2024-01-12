import { twistyScrubberCSS } from "./TwistyScrubber.css";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import type { DetailedTimelineInfo } from "../../model/props/timeline/DetailedTimelineInfoProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { globalSafeDocument } from "../document";
import type { TwistyPlayerController } from "../../controllers/TwistyPlayerController";
import { BoundaryType, Direction } from "../../controllers/AnimationTypes";
import type { ColorScheme } from "../../model/props/viewer/ColorSchemeRequestProp";

const SLOW_DOWN_SCRUBBING = false;

let isMouseDown = false;

globalSafeDocument?.addEventListener(
  "mousedown",
  (event) => {
    if (event.which) {
      isMouseDown = true;
    }
  },
  true,
);

globalSafeDocument?.addEventListener(
  "mouseup",
  (event) => {
    if (event.which) {
      isMouseDown = false;
    }
  },
  true,
);

// var x = 0;
let y = 0;
let clickNum = 0;

globalSafeDocument?.addEventListener(
  "mousedown",
  () => {
    clickNum++;
  },
  false,
);

globalSafeDocument?.addEventListener("mousemove", onMouseUpdate, false);
globalSafeDocument?.addEventListener("mouseenter", onMouseUpdate, false);

function onMouseUpdate(e: MouseEvent) {
  // x = e.pageX;
  y = e.pageY;
  // console.log(x, y);
}

const lastVal = 0;
let lastPreval = 0;
let scaling: boolean = false;
let currentClickNum = 0;

// Values are integers.
export class TwistyScrubber extends ManagedCustomElement {
  constructor(
    public model?: TwistyPlayerModel,
    public controller?: TwistyPlayerController,
  ) {
    super();
  }

  async onDetailedTimelineInfo(
    detailedTimelineInfo: DetailedTimelineInfo,
  ): Promise<void> {
    // TODO: is this efficient enough?
    const inputElem = await this.inputElem();
    inputElem.min = detailedTimelineInfo.timeRange.start.toString();
    inputElem.max = detailedTimelineInfo.timeRange.end.toString();
    inputElem.disabled = inputElem.min === inputElem.max;
    inputElem.value = detailedTimelineInfo.timestamp.toString();
  }

  async connectedCallback(): Promise<void> {
    this.addCSS(twistyScrubberCSS);
    this.addElement(await this.inputElem());
    this.model?.twistySceneModel.colorScheme.addFreshListener(
      this.updateColorScheme.bind(this),
    );
  }

  updateColorScheme(colorScheme: ColorScheme): void {
    this.contentWrapper.classList.toggle("dark-mode", colorScheme === "dark");
  }

  #inputElem: Promise<HTMLInputElement> | null = null;
  async inputElem(): Promise<HTMLInputElement> {
    // console.log("inputElem", this.#inputElem);
    return (this.#inputElem ??= (async () => {
      const elem = document.createElement("input");
      elem.type = "range";
      elem.disabled = true;

      // console.log("1");
      this.model?.detailedTimelineInfo.addFreshListener(
        this.onDetailedTimelineInfo.bind(this),
      );
      // console.log("3");
      elem.addEventListener("input", this.onInput.bind(this));
      elem.addEventListener("keydown", this.onKeypress.bind(this));

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
    this.model?.playingInfo.set({ playing: false });
    this.model?.timestampRequest.set(value);
  }

  onKeypress(e: KeyboardEvent): void {
    switch (e.key) {
      case "ArrowLeft":
      // fallthrough
      case "ArrowRight": {
        this.controller?.animationController.play({
          direction:
            e.key === "ArrowLeft" ? Direction.Backwards : Direction.Forwards,
          untilBoundary: BoundaryType.Move,
        });
        e.preventDefault();
        break;
      }
      case " ": {
        this.controller?.togglePlay();
        e.preventDefault();
        break;
      }
    }
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
        scale = Math.max(2 ** (-(yDist - 64) / 64), 1 / 32);
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
          (preVal - lastVal) * Math.min(1, (1 / 2) ** ((yDist * yDist) / 64));
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

customElementsShim.define("twisty-scrubber", TwistyScrubber);
