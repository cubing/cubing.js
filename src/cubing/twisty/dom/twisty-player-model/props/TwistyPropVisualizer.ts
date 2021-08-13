import { ManagedCustomElement } from "../../element/ManagedCustomElement";
import { customElementsShim } from "../../element/node-custom-element-shims";
import type { TwistyPropParent } from "./TwistyProp";

export class TwistyPropVisualizer extends ManagedCustomElement {
  constructor(private twistyProp: TwistyPropParent<any>) {
    super();
  }

  valueElem: HTMLElement | null = null;

  connectedCallback(): void {
    this.contentWrapper.append(this.twistyProp.constructor.name);

    this.valueElem = this.contentWrapper.appendChild(
      document.createElement("div"),
    );
    this.twistyProp.addListener(() => this.onProp(), { initial: true });
  }

  async onProp(): Promise<void> {
    const value = await this.twistyProp.get();
    // console.log("onProp", value, this.valueElem, JSON.stringify(value));

    // let str: string;
    // if (experimentalIs(value, Alg)) {
    //   str = value.toString();
    // } else {
    //   str = JSON.stringify(value).slice(0, 100);
    // }

    if (this.valueElem) {
      this.valueElem.textContent = JSON.stringify(value).slice(0, 100);
    }
  }
}

customElementsShim.define("twisty-prop-visualizer", TwistyPropVisualizer);

const visualizerListElem = document.createElement("div");

const VISUALIZE = true;
export function addVisualizer(twistyProp: TwistyPropParent<any>): void {
  if (VISUALIZE) {
    visualizerListElem.appendChild(new TwistyPropVisualizer(twistyProp));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(visualizerListElem);
});
