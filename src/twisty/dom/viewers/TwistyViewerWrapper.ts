import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { twistyViewerWrapperCSS } from "./TwistyViewerWrapper.css";

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
  constructor(config: TwistyViewerWrapperConfig = {}) {
    super();
    this.addCSS(twistyViewerWrapperCSS);
    this.contentWrapper.classList.toggle(
      "checkered",
      config.checkered ?? false,
    );
    if (config.backView && config.backView in backViewLayouts) {
      this.contentWrapper.classList.add(`back-view-${config.backView}`);
    }
  }

  set checkered(checkered: boolean) {
    this.contentWrapper.classList.toggle("checkered", checkered);
  }
}

if (customElements) {
  customElements.define("twisty-viewer-wrapper", TwistyViewerWrapper);
}
