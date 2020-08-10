import { ManagedCustomElement } from "../element/ManagedCustomElement";
import { twistyViewerWrapperCSS } from "./TwistyViewerWrapper.css";

export type BackViewLayout = "none" | "side-by-side" | "upper-right";
export const backViewLayouts = ["none", "side-by-side", "upper-right"];

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
    if (
      config.backView &&
      (backViewLayouts as string[]).includes(config.backView)
    ) {
      this.contentWrapper.classList.add(`back-view-${config.backView}`);
    }
  }
}

if (customElements) {
  customElements.define("twisty-viewer-wrapper", TwistyViewerWrapper);
}
