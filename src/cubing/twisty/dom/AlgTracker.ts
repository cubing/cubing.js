// TODO: see if this can replace AlgCursor?

import { Alg } from "../../alg";
import { algTrackerCSS } from "./AlgTracker.css_";
import { algTrackerCharSearch } from "./AlgTrackerStartCharSearch";
import { ClassListManager } from "./element/ClassListManager";
import { ManagedCustomElement } from "./element/ManagedCustomElement";
import { customElementsShim } from "./element/node-custom-element-shims";

export class AlgTracker extends ManagedCustomElement {
  #alg: Alg = new Alg();
  #textarea: HTMLTextAreaElement = document.createElement("textarea");
  #carbonCopy: HTMLDivElement = document.createElement("div");
  #carbonCopyPrefix: HTMLSpanElement = document.createElement("span");
  #carbonCopyHighlight: HTMLSpanElement = document.createElement("span");

  #textareaClassListManager: ClassListManager<
    "none" | "warning" | "error"
  > = new ClassListManager(this, "issue-", ["none", "warning", "error"]);

  #textareaClassListValidForPuzzleManager: ClassListManager<
    "none" | "warning" | "error"
  > = new ClassListManager(this, "valid-for-puzzle-", [
    "none",
    "warning",
    "error",
  ]);

  constructor() {
    super();
    this.#carbonCopy.classList.add("carbon-copy");
    this.addElement(this.#carbonCopy);
    this.addElement(this.#textarea);
    this.#carbonCopyPrefix.classList.add("prefix");
    this.#carbonCopy.appendChild(this.#carbonCopyPrefix);
    this.#carbonCopyHighlight.classList.add("highlight");
    this.#carbonCopy.appendChild(this.#carbonCopyHighlight);

    this.addCSS(algTrackerCSS);

    this.#textarea.addEventListener("input", () => this.onInput());
    document.addEventListener("selectionchange", () =>
      this.onSelectionChange(),
    );
  }

  // TODO
  set algString(s: string) {
    this.#textarea.value = s;
    this.onInput();
  }

  onInput(): void {
    this.#carbonCopyPrefix.textContent = this.#textarea.value;
    this.#carbonCopyHighlight.textContent = "";
    try {
      this.#alg = new Alg(this.#textarea.value);
      this.dispatchEvent(
        new CustomEvent("effectiveAlgChange", { detail: { alg: this.#alg } }),
      );
      this.#textareaClassListManager.setValue(
        // TODO: better heuristics to avoid warning during editing
        this.#alg.toString().trimEnd() === this.#textarea.value.trimEnd()
          ? "none"
          : "warning",
      );
    } catch (e) {
      this.#alg = new Alg();
      this.dispatchEvent(
        new CustomEvent("effectiveAlgChange", { detail: { alg: this.#alg } }),
      );
      this.#textareaClassListManager.setValue("error");
    }
    console.log(this.#alg);
  }

  onSelectionChange(): void {
    if (
      document.activeElement !== this ||
      this.shadow.activeElement !== this.#textarea
    ) {
      return;
    }
    console.log(this.#textarea.selectionStart);
    const dataUp = algTrackerCharSearch(this.#alg, {
      startCharIdxMin: this.#textarea.selectionStart,
      numMovesSofar: 0,
    });
    if ("latestUnit" in dataUp) {
      this.dispatchEvent(
        new CustomEvent("animatedMoveIndexChange", {
          detail: {
            idx: dataUp.animatedMoveIdx,
            isAtStartOfLeaf:
              this.#textarea.selectionStart ===
              dataUp.latestUnit.startCharIndex,
            leaf: dataUp.latestUnit,
          },
        }),
      );

      this.#carbonCopyPrefix.textContent = this.#textarea.value.slice(
        0,
        dataUp.latestUnit.startCharIndex,
      );
      this.#carbonCopyHighlight.textContent = this.#textarea.value.slice(
        dataUp.latestUnit.startCharIndex,
        dataUp.latestUnit.endCharIndex,
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("animatedMoveIndexChange", {
          detail: { idx: dataUp.animatedMoveCount, isAtStartOfLeaf: false },
        }),
      );
    }
  }

  setAlgValidForPuzzle(valid: boolean) {
    this.#textareaClassListValidForPuzzleManager.setValue(
      valid ? "none" : "error",
    );
  }
}

customElementsShim.define("alg-tracker", AlgTracker);
