import { TwistyPlayer } from "../..";
import { Alg } from "../../../alg";
import { getPuzzleDescriptionString } from "../../../puzzle-geometry";
import { puzzles } from "../../../puzzles";
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
    if (!this.a) {
      return;
    }

    const config = getConfigFromURL("", this.a.href);

    const href = this.a?.href;
    const { hostname, pathname } = new URL(href);

    if (hostname !== "alpha.twizzle.net") {
      return;
    }
    if (["/edit/", "/explore/"].includes(pathname)) {
      const isExplorer = pathname === "/explore/";

      if (config.puzzle && !(config.puzzle in puzzles)) {
        const puzzleDescription = getPuzzleDescriptionString(config.puzzle);
        delete config.puzzle;
        config.experimentalPuzzleDescription = puzzleDescription;
      }

      this.twistyPlayer = this.addElement(
        new TwistyPlayer({
          ...config,
          viewerLink: isExplorer ? "experimental-twizzle-explorer" : "auto",
        }),
      );

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
