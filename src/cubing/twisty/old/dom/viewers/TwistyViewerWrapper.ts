import {
  BackViewLayout,
  backViewLayouts,
} from "../../../model/props/viewer/BackViewProp";
import { ClassListManager } from "../element/ClassListManager";
import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { customElementsShim } from "../element/node-custom-element-shims";
import { twistyViewerWrapperCSS } from "./TwistyViewerWrapper.css";

export interface TwistyViewerWrapperConfig {
  backView?: BackViewLayout;
}

export class TwistyViewerWrapper extends ManagedCustomElement {
  #backViewClassListManager: ClassListManager<BackViewLayout> =
    new ClassListManager(this, "back-view-", [
      "none",
      "side-by-side",
      "top-right",
    ]);

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
