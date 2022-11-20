import { TwistyPlayer } from "../..";
import { Alg } from "../../../alg";
import { puzzles } from "../../../puzzles";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { TwistyAlgViewer } from "../TwistyAlgViewer";
import { twizzleLinkCSS, twizzleLinkForumTweaksCSS } from "./TwizzleLink.css";
import { getConfigFromURL } from "./url-params";

/** @category Other Custom Elements */
export class TwizzleLink extends ManagedCustomElement {
  twistyPlayer: TwistyPlayer | null = null;
  a: HTMLAnchorElement | null = null;
  constructor(
    private options?: { cdnForumTweaks?: boolean; darkMode: boolean },
  ) {
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
    this.#cssElem?.remove();
    this.#cssCDNForumTweaksElem?.remove();
  }

  #cssElem: HTMLStyleElement | undefined;
  #cssCDNForumTweaksElem: HTMLStyleElement | undefined;
  #scrollableRegion: HTMLDivElement;
  async connectedCallback() {
    console.log(this.options?.darkMode);
    if (this.options?.darkMode) {
      this.contentWrapper.classList.add("dark-mode");
    }
    this.#cssElem = this.addCSS(twizzleLinkCSS);
    if (this.options?.cdnForumTweaks) {
      this.addCSS(twizzleLinkForumTweaksCSS);
    }
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
          background: this.options?.cdnForumTweaks
            ? "checkered-transparent"
            : "checkered",
          darkMode: this.options?.darkMode ? "dark" : "light",
          ...config,
          viewerLink: isExplorer ? "experimental-twizzle-explorer" : "auto",
        }),
      );

      this.#scrollableRegion = this.addElement(document.createElement("div"));
      this.#scrollableRegion.classList.add("scrollable-region");

      if (config.experimentalTitle) {
        this.addHeading(config.experimentalTitle).classList.add("title");
        // const setupAlgDiv = this.addElement(document.createElement("div"));
        // setupAlgDiv.classList.add("setup-alg");
        // setupAlgDiv.textContent = puzzles[config.puzzle ?? "3x3x3"].fullName;
      }

      if (config.experimentalSetupAlg) {
        this.addHeading(
          "Setup",
          async () =>
            (
              await this.twistyPlayer?.experimentalModel.setupAlg.get()
            )?.alg.toString() ?? null,
        );

        const setupAlgDiv = this.#scrollableRegion.appendChild(
          document.createElement("div"),
        );
        setupAlgDiv.classList.add("setup-alg");
        setupAlgDiv.textContent = new Alg(
          config.experimentalSetupAlg,
        ).toString();
      }
      this.addHeading(
        "Moves",
        async () =>
          (
            await this.twistyPlayer?.experimentalModel.alg.get()
          )?.alg.toString() ?? null,
      );
      const twistyAlgViewer = this.#scrollableRegion.appendChild(
        new TwistyAlgViewer({ twistyPlayer: this.twistyPlayer }),
      );
      twistyAlgViewer.part.add("twisty-alg-viewer");
    } else {
      this.fallback();
    }
  }

  addHeading(
    text: string,
    getTextToCopy?: () => Promise<string | null>,
  ): HTMLElement {
    const headingDiv = this.#scrollableRegion!.appendChild(
      document.createElement("div"),
    );
    headingDiv.classList.add("heading");
    headingDiv.textContent = text;
    if (getTextToCopy) {
      headingDiv.textContent += " ";
      const a = headingDiv.appendChild(document.createElement("a"));
      a.textContent = "📋";
      a.href = "#";
      a.title = "Copy to clipboard";
      async function setAndClear(text: string) {
        a.textContent = text;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (a.textContent === text) {
          a.textContent = "📋";
        }
      }
      a.addEventListener("click", async (e) => {
        e.preventDefault();
        a.textContent = "📋…";
        const textToCopy = await getTextToCopy();
        if (textToCopy) {
          try {
            await navigator.clipboard.writeText(textToCopy);
            setAndClear("📋✅");
          } catch (e) {
            setAndClear("📋❌");
            throw e;
          }
        } else {
          setAndClear("📋❌");
        }
      });
    }
    return headingDiv;
  }
}

customElementsShim.define("twizzle-link", TwizzleLink);
declare global {
  interface HTMLElementTagNameMap {
    "twizzle-link": TwizzleLink;
  }
}
