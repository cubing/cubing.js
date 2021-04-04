import { ClassListManager } from "../element/ClassListManager";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { customElementsShim } from "../element/node-custom-element-shims";
import { twistyViewerWrapperCSS } from "./TwistyViewerWrapper.css";

export const backViewLayouts = {
  "none": true, // default
  "side-by-side": true,
  "top-right": true,
};
export type BackViewLayout = keyof typeof backViewLayouts;

export interface TwistyViewerWrapperConfig {
  backView?: BackViewLayout;
}

export class TwistyViewerWrapper extends ManagedCustomElement {
  #backViewClassListManager: ClassListManager<BackViewLayout> = new ClassListManager(
    this,
    "back-view-",
    ["none", "side-by-side", "top-right"],
  );

  constructor(config: TwistyViewerWrapperConfig = {}) {
    super();
    this.addCSS(twistyViewerWrapperCSS);

    if (config.backView && config.backView in backViewLayouts) {
      this.#backViewClassListManager.setValue(config.backView);
    }
  }

  // Returns if the value changed
  /** @deprecated */
  setBackView(backView: BackViewLayout): boolean {
    return this.#backViewClassListManager.setValue(backView);
  }

  clear(): void {
    this.contentWrapper.innerHTML = "";
  }
}

customElementsShim.define("twisty-viewer-wrapper", TwistyViewerWrapper);
