import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { TwistyPlayerModel } from "../props/TwistyPlayerModel";

// Values are integers.
export class TwistyScrubberV2 extends ManagedCustomElement {
  constructor(public model?: TwistyPlayerModel) {
    super();
  }

  async onTimeRange(): Promise<void> {
    if (this.model) {
      const timeRange = await this.model.timeRangeProp.get();
      const inputElem = await this.inputElem();
      inputElem.min = timeRange.start.toString();
      inputElem.max = timeRange.end.toString();
    }
  }

  async onTimestamp(): Promise<void> {
    if (this.model) {
      const timestamp = await this.model.timestampProp.get();
      const inputElem = await this.inputElem();
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
      this.model?.timestampProp.addListener(this.onTimestamp.bind(this), {
        initial: true,
      });

      elem.addEventListener("input", this.onInput.bind(this));

      return elem;
    })());
  }

  async onInput(): Promise<void> {
    const value = parseInt((await this.inputElem()).value);
    console.log("on input", value);
    this.model?.timestampProp.set(value);
  }
}

customElementsShim.define("twisty-scrubber-v2", TwistyScrubberV2);
