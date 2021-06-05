// TODO: see if this can replace AlgCursor?

import type { ExperimentalParsed } from "../../alg";
import { Alg, Move, Pause } from "../../alg";
import { TwistyPlayer } from "../../twisty";
import type { TimeRange } from "../animation/cursor/AlgCursor";
import type { MillisecondTimestamp } from "../animation/cursor/CursorTypes";
import { algEditorCSS } from "./AlgEditor.css_";
import { algEditorCharSearch } from "./AlgEditorStartCharSearch";
import { ClassListManager } from "./element/ClassListManager";
import { ManagedCustomElement } from "./element/ManagedCustomElement";
import { customElementsShim } from "./element/node-custom-element-shims";

const ATTRIBUTE_FOR_TWISTY_PLAYER = "for-twisty-player";

// function parsePx(s: string): number {
//   if (s.slice(-2) !== "px") {
//     throw new Error(`Expected px suffix: ${s}`);
//   }
//   return parseInt(s.slice(0, -2));
// }

export class AlgEditor extends ManagedCustomElement {
  #alg: Alg = new Alg();
  #textarea: HTMLTextAreaElement = document.createElement("textarea");
  #carbonCopy: HTMLDivElement = document.createElement("div");
  #carbonCopyPrefix: HTMLSpanElement = document.createElement("span");
  #carbonCopyHighlight: HTMLSpanElement = document.createElement("span");

  #highlightedLeaf: ExperimentalParsed<Move | Pause> | null = null;

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

  #twistyPlayer: TwistyPlayer | null = null;

  constructor(options?: { twistyPlayer?: TwistyPlayer }) {
    super();
    this.#carbonCopy.classList.add("carbon-copy");
    this.addElement(this.#carbonCopy);
    this.#textarea.rows = 1;
    this.addElement(this.#textarea);
    this.#carbonCopyPrefix.classList.add("prefix");
    this.#carbonCopy.appendChild(this.#carbonCopyPrefix);
    this.#carbonCopyHighlight.classList.add("highlight");
    this.#carbonCopy.appendChild(this.#carbonCopyHighlight);

    // Prevent iOS from defaulting to smart quotes.
    this.#textarea.setAttribute("spellcheck", "false");

    this.addCSS(algEditorCSS);

    // TODO: What set of events should we register? `change`? `keydown`?
    this.#textarea.addEventListener("input", () => this.onInput());
    document.addEventListener("selectionchange", () =>
      this.onSelectionChange(),
    );

    if (options?.twistyPlayer) {
      this.twistyPlayer = options.twistyPlayer;
    }
  }

  // TODO
  set algString(s: string) {
    this.#textarea.value = s;
    this.onInput();
  }

  // TODO: remove?
  get algString(): string {
    return this.#textarea.value;
  }

  // To we need a getter?
  set placeholder(placeholderText: string) {
    this.#textarea.placeholder = placeholderText;
  }

  resizeTextarea(): void {
    // This seems to be reasonably performant. Direct calculation is tricky
    // because we're trying to find the least fixed point of recursive constraints:
    //
    // - Textarea height depends on line wrapping,
    // - which depends on textarea width,
    // - which may depends on parent width,
    // - which may change if the textarea height is large enough to cause
    //   scrolling.
    //
    // In practice, it seems that `this.#textarea.clientHeight` and
    // `this.#textarea.scrollHeight` match when the wrapped text fits inside the
    // textarea without scrolling (but I don't know if this is guaranteed).
    if (this.#textarea.clientHeight < this.#textarea.scrollHeight) {
      while (this.#textarea.clientHeight < this.#textarea.scrollHeight) {
        this.#textarea.rows++;
      }
      return;
    } else {
      while (this.#textarea.clientHeight === this.#textarea.scrollHeight) {
        if (this.#textarea.rows === 1) {
          return;
        }
        this.#textarea.rows--;
      }
      this.#textarea.rows++;
    }

    // Here's some old code that almost worked (but doesn't work if the parent scrollbar depends on how long the alg is):

    // this.#textarea.style.maxHeight = "1px";
    // const computedStyle = getComputedStyle(this.#textarea);
    // const paddingTop = parsePx(computedStyle.getPropertyValue("padding-top"));
    // const paddingBottom = parsePx(
    //   computedStyle.getPropertyValue("padding-bottom"),
    // );
    // this.#textarea.style.paddingTop = "0px"; // Workaround for Firefox, which doesn't calculate the same `scrollHeight` as Chromium and WebKit without this. https://bugzilla.mozilla.org/show_bug.cgi?id=576976
    // this.#textarea.style.paddingBottom = "0px"; // Workaround for Firefox, which doesn't calculate the same `scrollHeight` as Chromium and WebKit without this. https://bugzilla.mozilla.org/show_bug.cgi?id=576976
    // this.#textarea.style.height = `${
    //   this.#textarea.scrollHeight + paddingTop + paddingBottom
    // }px`;
    // this.#textarea.style.maxHeight = "";
    // this.#textarea.style.paddingTop = "";
    // this.#textarea.style.paddingBottom = "";
  }

  onInput(): void {
    this.#carbonCopyHighlight.hidden = true;
    this.resizeTextarea();

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
    // console.log(this.#alg);
  }

  onSelectionChange(): void {
    if (
      document.activeElement !== this ||
      this.shadow.activeElement !== this.#textarea
    ) {
      return;
    }
    // console.log(this.#textarea.selectionStart);
    const dataUp = algEditorCharSearch(this.#alg, {
      targetCharIdx: this.#textarea.selectionStart,
      numMovesSofar: 0,
    });
    if ("latestUnit" in dataUp) {
      this.dispatchEvent(
        new CustomEvent("animatedMoveIndexChange", {
          detail: {
            idx: dataUp.animatedMoveIdx,
            isAtStartOfLeaf:
              this.#textarea.selectionStart >=
                dataUp.latestUnit.startCharIndex &&
              this.#textarea.selectionStart < dataUp.latestUnit.endCharIndex,
            leaf: dataUp.latestUnit,
          },
        }),
      );
      this.highlightLeaf(dataUp.latestUnit);
    } else {
      this.dispatchEvent(
        new CustomEvent("animatedMoveIndexChange", {
          detail: { idx: dataUp.animatedMoveCount, isPartiallyInLeaf: false },
        }),
      );
    }
  }

  setAlgValidForPuzzle(valid: boolean) {
    this.#textareaClassListValidForPuzzleManager.setValue(
      valid ? "none" : "error",
    );
  }

  highlightLeaf(leaf: ExperimentalParsed<Move | Pause>): void {
    if (leaf === this.#highlightedLeaf) {
      return;
    }
    this.#highlightedLeaf = leaf;
    this.#carbonCopyPrefix.textContent = this.#textarea.value.slice(
      0,
      leaf.startCharIndex,
    );
    this.#carbonCopyHighlight.textContent = this.#textarea.value.slice(
      leaf.startCharIndex,
      leaf.endCharIndex,
    );
    this.#carbonCopyHighlight.hidden = false;
  }

  get twistyPlayer(): TwistyPlayer | null {
    return this.#twistyPlayer;
  }

  // TODO: spread out this impl over private methods instead of self-listeners.
  set twistyPlayer(twistyPlayer: TwistyPlayer | null) {
    if (this.#twistyPlayer) {
      // TODO: support reassigment/clearing
      console.warn("twisty-player reassignment/clearing is not supported");
      return;
    }
    this.#twistyPlayer = twistyPlayer;

    this.addEventListener(
      "effectiveAlgChange",
      (e: CustomEvent<{ alg: Alg }>) => {
        try {
          this.#twistyPlayer!.alg = e.detail.alg;
          this.setAlgValidForPuzzle(true);
        } catch (e) {
          console.error("cannot set alg for puzzle", e);
          this.#twistyPlayer!.alg = new Alg();
          this.setAlgValidForPuzzle(false);
        }
      },
    );

    this.addEventListener(
      "animatedMoveIndexChange",
      (
        e: CustomEvent<{
          idx: number;
          isAtStartOfLeaf: Blob;
          leaf: ExperimentalParsed<Move | Pause>;
        }>,
      ) => {
        try {
          const timestamp = this.#twistyPlayer!.cursor!.experimentalTimestampFromIndex(
            e.detail.idx,
          );
          // console.log(e.detail, timestamp, e.detail.leaf);
          this.#twistyPlayer!.timeline.setTimestamp(
            timestamp + (e.detail.isAtStartOfLeaf ? 250 : 0),
          );
        } catch (e) {
          // console.error("cannot set idx", e);
          this.#twistyPlayer!.timeline.timestamp = 0;
        }
      },
    );

    this.#twistyPlayer!.timeline!.addTimestampListener({
      onTimelineTimestampChange: (timestamp: MillisecondTimestamp): void => {
        const idx = this.#twistyPlayer!.cursor!.experimentalIndexFromTimestamp(
          timestamp,
        );
        const move = this.#twistyPlayer!.cursor!.experimentalMoveAtIndex(idx);
        if (move) {
          this.highlightLeaf(move as ExperimentalParsed<Move>);
        }
      },

      onTimeRangeChange: (_timeRange: TimeRange): void => {},
    });
  }

  protected attributeChangedCallback(
    attributeName: string,
    _oldValue: string,
    newValue: string,
  ): void {
    if (attributeName === ATTRIBUTE_FOR_TWISTY_PLAYER) {
      const elem = document.getElementById(newValue);
      if (!elem) {
        console.warn(`${ATTRIBUTE_FOR_TWISTY_PLAYER}= elem does not exist`);
        return;
      }
      if (!(elem instanceof TwistyPlayer)) {
        // TODO: avoid assuming single instance of lib?
        console.warn(`${ATTRIBUTE_FOR_TWISTY_PLAYER}=is not a twisty-player`);
        return;
      }
      this.twistyPlayer = elem;
    } else if (attributeName === "placeholder") {
      this.placeholder = newValue;
    }
  }

  static get observedAttributes(): string[] {
    return [ATTRIBUTE_FOR_TWISTY_PLAYER];
  }
}

customElementsShim.define("alg-editor", AlgEditor);
