import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { twistyViewerWrapperCSS } from "./TwistyViewerWrapper.css";

export enum BackViewLayout {
  "none" = "none", // default
  "side-by-side" = "side-by-side",
  "upper-right" = "upper-right",
}

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
    if (config.backView && config.backView in BackViewLayout) {
      this.contentWrapper.classList.add(`back-view-${config.backView}`);
    }
  }
}

if (customElements) {
  customElements.define("twisty-viewer-wrapper", TwistyViewerWrapper);
}
