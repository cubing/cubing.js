import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { twistyViewerWrapperCSS } from "./TwistyViewerWrapper.css";
import { ClassListManager } from "../element/ClassListManager";
import { customElementsShim } from "../element/node-custom-element-shims";

export const backViewLayouts = {
  "none": true, // default
  "side-by-side": true,
  "upper-right": true,
};
export type BackViewLayout = keyof typeof backViewLayouts;

export interface TwistyViewerWrapperConfig {
  checkered?: boolean;
  backView?: BackViewLayout;
}

export class TwistyViewerWrapper extends ManagedCustomElement {
  #backViewClassListManager: ClassListManager<
    BackViewLayout
  > = new ClassListManager(this, "back-view-", [
    "none",
    "side-by-side",
    "upper-right",
  ]);

  constructor(private config: TwistyViewerWrapperConfig = {}) {
    super();
    this.addCSS(twistyViewerWrapperCSS);

    this.contentWrapper.classList.toggle(
      "checkered",
      config.checkered ?? false,
    );
    if (config.backView && config.backView in backViewLayouts) {
      this.#backViewClassListManager.setValue(config.backView);
    }
  }

  // Returns if the value changed
  setBackView(backView: BackViewLayout): boolean {
    return this.#backViewClassListManager.setValue(backView);
  }

  set checkered(checkered: boolean) {
    this.config.checkered = checkered;
    this.contentWrapper.classList.toggle("checkered", checkered);
  }
}

customElementsShim.define("twisty-viewer-wrapper", TwistyViewerWrapper);
