import { TwistyPlayer } from "../..";
import { Alg } from "../../../alg";
import { puzzles } from "../../../puzzles";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { TwistyAlgViewer } from "../TwistyAlgViewer";
import { twizzleLinkCSS } from "./TwizzleLink.css";
import { getConfigFromURL } from "./url-params";

/** @category Other Custom Elements */
export class TwizzleLink extends ManagedCustomElement {
  twistyPlayer: TwistyPlayer | null = null;
  a: HTMLAnchorElement | null = null;
  constructor() {
    super({ mode: "open" });
  }

  fallback() {
    this.contentWrapper.textContent = "";
    if (this.a) {
      const span = this.contentWrapper.appendChild(
        document.createElement("span"),
      );
      span.textContent = "❗️";
      span.title = "Could not show a player for link";
      this.addElement(this.a);
    }
    if (this.#cssElem) {
      this.#cssElem.remove();
    }
  }

  #cssElem: HTMLStyleElement | undefined;
  async connectedCallback() {
    this.#cssElem = this.addCSS(twizzleLinkCSS);
    this.a = this.querySelector("a");
    if (!this.a) {
      return;
    }

    const config = getConfigFromURL("", this.a.href);

    const href = this.a?.href;
    const { hostname, pathname } = new URL(href);

    if (hostname !== "alpha.twizzle.net") {
      this.fallback();
      return;
    }
    if (["/edit/", "/explore/"].includes(pathname)) {
      const isExplorer = pathname === "/explore/";

      if (config.puzzle && !(config.puzzle in puzzles)) {
        const puzzleDescription = (
          await import("../../../puzzle-geometry")
        ).getPuzzleDescriptionString(config.puzzle);
        delete config.puzzle;
        config.experimentalPuzzleDescription = puzzleDescription;
      }

      this.twistyPlayer = this.addElement(
        new TwistyPlayer({
          ...config,
          viewerLink: isExplorer ? "experimental-twizzle-explorer" : "auto",
        }),
      );

      if (config.experimentalTitle) {
        this.addHeading(config.experimentalTitle).classList.add("title");
        // const setupAlgDiv = this.addElement(document.createElement("div"));
        // setupAlgDiv.classList.add("setup-alg");
        // setupAlgDiv.textContent = puzzles[config.puzzle ?? "3x3x3"].fullName;
      }

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
    } else {
      this.fallback();
    }
  }

  addHeading(text: string): HTMLElement {
    const headingDiv = this.addElement(document.createElement("div"));
    headingDiv.classList.add("heading");
    headingDiv.textContent = text;
    return headingDiv;
  }
}

customElementsShim.define("twizzle-link", TwizzleLink);
declare global {
  interface HTMLElementTagNameMap {
    "twizzle-link": TwizzleLink;
  }
}
