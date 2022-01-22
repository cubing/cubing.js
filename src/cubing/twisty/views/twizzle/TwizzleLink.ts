import { TwistyPlayer } from "../..";
import { Alg } from "../../../alg";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { TwistyAlgViewer } from "../TwistyAlgViewer";
import { twizzleLinkCSS } from "./TwizzleLink.css";
import { getConfigFromURL } from "./url-params";

export class TwizzleLink extends ManagedCustomElement {
  twistyPlayer: TwistyPlayer | null = null;
  a: HTMLAnchorElement | null = null;
  constructor() {
    super({ mode: "open" });
  }
  connectedCallback() {
    this.addCSS(twizzleLinkCSS);
    this.a = this.querySelector("a");
    if (this.a) {
      const config = getConfigFromURL("", this.a.href);
      this.twistyPlayer = this.addElement(new TwistyPlayer(config));

      if (config.experimentalSetupAlg) {
        this.addHeading("Setup");

        const setupAlgDiv = this.addElement(document.createElement("div"));
        setupAlgDiv.classList.add("setup-alg");
        setupAlgDiv.textContent = new Alg(
          config.experimentalSetupAlg,
        ).toString();
      }
      this.addHeading("Moves");
      const twistyAlgViewer = this.addElement(
        new TwistyAlgViewer({ twistyPlayer: this.twistyPlayer }),
      );
      twistyAlgViewer.part.add("twisty-alg-viewer");
    }
  }

  addHeading(text: string): void {
    const headingDiv = this.addElement(document.createElement("div"));
    headingDiv.classList.add("heading");
    headingDiv.textContent = text;
  }
}

customElementsShim.define("twizzle-link", TwizzleLink);
