import { Alg } from "../../../alg";
import {
  ExperimentalCommonMetric,
  experimentalCountMetricMoves,
} from "../../../notation";
import { puzzles } from "../../../puzzles";
import { TwistyPlayer } from "../..";
import type { ColorSchemeWithAuto } from "../../model/props/viewer/ColorSchemeRequestProp";
import type { TwistyPlayerModel } from "../../model/TwistyPlayerModel";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { TwistyAlgViewer } from "../TwistyAlgViewer";
import { twizzleLinkCSS, twizzleLinkForumTweaksCSS } from "./TwizzleLink.css";
import { getConfigFromURL } from "./url-params";

/** @category Other Custom Elements */

// Non-breaking space
// const NBSP = "\xa0";

const OUTER_BLOCK_MOVES_EXPLANATION = "outer block moves (e.g. R, Rw, or 4r)";
const INNER_BLOCK_MOVES_EXPLANATION = "inner block moves (e.g. M or 2-5r)";

// TODO: calculate descriptions from the cost factors directly.
const METRIC_EXPLANATIONS: Partial<Record<ExperimentalCommonMetric, string>> = {
  [ExperimentalCommonMetric.OuterBlockTurnMetric]: `HTM = OBTM ("Outer Block Turn Metric"):
• ${INNER_BLOCK_MOVES_EXPLANATION} count as 2 turns
• ${OUTER_BLOCK_MOVES_EXPLANATION} count as 1 turn
• rotations (e.g. x) count as 0 turns`,
  [ExperimentalCommonMetric.OuterBlockQuantumTurnMetric]: `QTM = OBQTM ("Outer Block Quantum Turn Metric"):
• ${INNER_BLOCK_MOVES_EXPLANATION} count as 2 turns per quantum (e.g. M2 counts as 4)
• ${OUTER_BLOCK_MOVES_EXPLANATION} count as 1 turn per quantum (e.g. R2 counts as 2)
• rotations (e.g. x) count as 0 turns`,
  [ExperimentalCommonMetric.RangeBlockTurnMetric]: `STM = RBTM ("Range Block Turn Metric"):
• ${INNER_BLOCK_MOVES_EXPLANATION} count as 1 turn
• ${OUTER_BLOCK_MOVES_EXPLANATION} count as 1 turn
• rotations (e.g. x) count as 0 turns`,
  [ExperimentalCommonMetric.RangeBlockQuantumTurnMetric]: `SQTM = RBQTM ("Range Block Quantum Turn Metric"):
• ${INNER_BLOCK_MOVES_EXPLANATION} count as 1 turn per quantum (e.g. M2 counts as 2)
• ${OUTER_BLOCK_MOVES_EXPLANATION} count as 1 turn per quantum (e.g. R2 counts as 2)
• rotations (e.g. x) count as 0 turns`,
  [ExperimentalCommonMetric.ExecutionTurnMetric]: `ETM ("Execution Turn Metric"):
• all moves (including rotations) count as 1 turn`,
};
// const LEGACY_METRIC_ABBREVIATIONS: Partial<
//   Record<ExperimentalCommonMetric, string>
// > = {
//   [ExperimentalCommonMetric.OuterBlockTurnMetric]: "h",
//   [ExperimentalCommonMetric.OuterBlockQuantumTurnMetric]: "q",
//   [ExperimentalCommonMetric.RangeBlockTurnMetric]: "s",
//   [ExperimentalCommonMetric.RangeBlockQuantumTurnMetric]: "sq",
//   [ExperimentalCommonMetric.ExecutionTurnMetric]: "e",
// };
const CONSISTENT_METRIC_ABBREVIATIONS: Partial<
  Record<ExperimentalCommonMetric, string>
> = {
  [ExperimentalCommonMetric.OuterBlockTurnMetric]: "OB",
  [ExperimentalCommonMetric.OuterBlockQuantumTurnMetric]: "OBQ",
  [ExperimentalCommonMetric.RangeBlockTurnMetric]: "RB",
  [ExperimentalCommonMetric.RangeBlockQuantumTurnMetric]: "RBQ",
  [ExperimentalCommonMetric.ExecutionTurnMetric]: "E",
};

export class TwizzleLink extends ManagedCustomElement {
  twistyPlayer: TwistyPlayer | null = null;
  a: HTMLAnchorElement | null = null;
  constructor(
    private options?: {
      cdnForumTweaks?: boolean;
      colorScheme?: ColorSchemeWithAuto;
    },
  ) {
    super({ mode: "open" });
  }

  #fallback() {
    this.contentWrapper.textContent = "";
    if (this.a) {
      const span = this.contentWrapper.appendChild(
        document.createElement("span"),
      );
      span.textContent = "❗️";
      span.title = "Could not show a player for link";
      this.addElement(this.a);
    }
    this.removeCSS(twizzleLinkCSS);
    const cssIndex = this.shadow.adoptedStyleSheets.indexOf(twizzleLinkCSS);
    if (typeof cssIndex !== "undefined") {
      this.shadow.adoptedStyleSheets.splice(cssIndex, cssIndex + 1);
    }
    this.#cssCDNForumTweaksElem?.remove();
  }

  #cssCDNForumTweaksElem?: HTMLStyleElement;
  #scrollableRegion?: HTMLDivElement;
  #responsiveWrapper?: HTMLDivElement;
  #moveCountElem?: HTMLSpanElement;
  async connectedCallback() {
    this.#responsiveWrapper = this.addElement(document.createElement("div"));
    this.#responsiveWrapper.classList.add("responsive-wrapper");
    if (this.options?.colorScheme === "dark") {
      this.contentWrapper.classList.add("dark-mode");
    }
    this.addCSS(twizzleLinkCSS);
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
      this.#fallback();
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

      this.twistyPlayer = this.#responsiveWrapper.appendChild(
        new TwistyPlayer({
          background: this.options?.cdnForumTweaks
            ? "checkered-transparent"
            : "checkered",
          colorScheme: this.options?.colorScheme === "dark" ? "dark" : "light",
          ...config,
          viewerLink: isExplorer ? "experimental-twizzle-explorer" : "auto",
        }),
      );
      this.twistyPlayer.fullscreenElement = this.contentWrapper;
      if (config.experimentalTitle) {
        this.twistyPlayer.experimentalTitle = config.experimentalTitle;
      }

      this.#scrollableRegion = this.#responsiveWrapper.appendChild(
        document.createElement("div"),
      );
      this.#scrollableRegion.classList.add("scrollable-region");

      if (config.experimentalTitle) {
        this.#addHeading(config.experimentalTitle).classList.add("title");
        // const setupAlgDiv = this.addElement(document.createElement("div"));
        // setupAlgDiv.classList.add("setup-alg");
        // setupAlgDiv.textContent = puzzles[config.puzzle ?? "3x3x3"].fullName;
      }

      if (config.experimentalSetupAlg) {
        this.#addHeading(
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
      const movesHeading = this.#addHeading(
        "Moves",
        async () =>
          (
            await this.twistyPlayer?.experimentalModel.alg.get()
          )?.alg.toString() ?? null,
      );

      this.#moveCountElem = movesHeading.appendChild(
        constructMoveCountDisplay(this.twistyPlayer.experimentalModel),
      );
      this.#moveCountElem.classList.add("move-count");

      const twistyAlgViewer = this.#scrollableRegion.appendChild(
        new TwistyAlgViewer({ twistyPlayer: this.twistyPlayer }),
      );
      twistyAlgViewer.part.add("twisty-alg-viewer");
    } else {
      this.#fallback();
    }
  }

  #addHeading(
    text: string,
    getTextToCopy?: () => Promise<string | null>,
  ): HTMLElement {
    const headingDiv = this.#scrollableRegion!.appendChild(
      document.createElement("div"),
    );
    headingDiv.classList.add("heading");
    // Wrapper span for grid layout.
    const wrapperSpan = headingDiv.appendChild(document.createElement("span"));
    wrapperSpan.textContent = text;
    if (getTextToCopy) {
      wrapperSpan.textContent += " ";
      const a = wrapperSpan.appendChild(document.createElement("a"));
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

export function constructMoveCountDisplay(
  model: TwistyPlayerModel,
  elem: HTMLSpanElement = document.createElement("span"),
): HTMLSpanElement {
  async function update() {
    const [algWithIssues, puzzleLoader] = await Promise.all([
      model.puzzleAlg.get(),
      model.puzzleLoader.get(),
    ]);
    if (algWithIssues.issues.errors.length !== 0) {
      elem.textContent = "";
      return;
    }
    let isFirstMetric = true;
    function addMetric(metric: ExperimentalCommonMetric) {
      if (isFirstMetric) {
        isFirstMetric = false;
      } else {
        elem.append(")(");
      }
      const span = elem.appendChild(document.createElement("span"));
      const moveCount = experimentalCountMetricMoves(
        puzzleLoader,
        metric,
        algWithIssues.alg,
      );
      span.append(`${CONSISTENT_METRIC_ABBREVIATIONS[metric]}: `);
      const moveNumber = span.appendChild(document.createElement("span"));
      moveNumber.textContent = moveCount.toString();
      moveNumber.classList.add("move-number");
      // span.title = METRIC_EXPLANATIONS[metric] ?? "";
      span.setAttribute("data-before", METRIC_EXPLANATIONS[metric] ?? "");
      span.setAttribute("title", METRIC_EXPLANATIONS[metric] ?? "");
    }

    elem.textContent = "(";
    if (puzzleLoader.id === "3x3x3") {
      addMetric(ExperimentalCommonMetric.OuterBlockTurnMetric);
      addMetric(ExperimentalCommonMetric.OuterBlockQuantumTurnMetric);
      addMetric(ExperimentalCommonMetric.RangeBlockTurnMetric);
    } else if (puzzleLoader.pg) {
      addMetric(ExperimentalCommonMetric.RangeBlockTurnMetric);
      addMetric(ExperimentalCommonMetric.RangeBlockQuantumTurnMetric);
    }
    addMetric(ExperimentalCommonMetric.ExecutionTurnMetric);
    elem.append(")");
  }
  model.puzzleAlg.addFreshListener(update);
  model.puzzleID.addFreshListener(update);
  return elem;
}
