// TODO: see if this can replace AlgCursor?

import type { ExperimentalParsed } from "../../alg";
import { Alg, Move, Pause } from "../../alg";
import type { AlgProp, AlgWithIssues } from "../model/depth-0/AlgProp";
import type { CurrentMoveInfo } from "../old/animation/indexer/AlgIndexer";
import { ClassListManager } from "../old/dom/element/ClassListManager";
import { ManagedCustomElement } from "../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../old/dom/element/node-custom-element-shims";
import { twistyAlgEditorCSS } from "../old/dom/TwistyAlgEditor.css_";
import { twistyAlgEditorCharSearch } from "../old/dom/TwistyAlgEditorStartCharSearch";
import { TwistyPlayerV2 } from "./TwistyPlayerV2";

const ATTRIBUTE_FOR_TWISTY_PLAYER = "for-twisty-player";
const ATTRIBUTE_PLACEHOLDER = "placeholder";
const ATTRIBUTE_TWISTY_PLAYER_PROP = "twisty-player-prop";

type TwistyPlayerAlgProp = "algProp" | "setupProp";

// function parsePx(s: string): number {
//   if (s.slice(-2) !== "px") {
//     throw new Error(`Expected px suffix: ${s}`);
//   }
//   return parseInt(s.slice(0, -2));
// }

export class TwistyAlgEditorV2 extends ManagedCustomElement {
  #alg: Alg = new Alg();
  #textarea: HTMLTextAreaElement = document.createElement("textarea");
  #carbonCopy: HTMLDivElement = document.createElement("div");
  #carbonCopyPrefix: HTMLSpanElement = document.createElement("span");
  #carbonCopyHighlight: HTMLSpanElement = document.createElement("span");

  #highlightedLeaf: ExperimentalParsed<Move | Pause> | null = null;

  #textareaClassListManager: ClassListManager<"none" | "warning" | "error"> =
    new ClassListManager(this, "issue-", ["none", "warning", "error"]);

  #textareaClassListValidForPuzzleManager: ClassListManager<
    "none" | "warning" | "error"
  > = new ClassListManager(this, "valid-for-puzzle-", [
    "none",
    "warning",
    "error",
  ]);

  #twistyPlayer: TwistyPlayerV2 | null = null;
  #twistyPlayerProp: TwistyPlayerAlgProp;
  get #algProp(): AlgProp | null {
    if (this.#twistyPlayer === null) {
      return null;
    } else {
      return this.#twistyPlayer.model[this.#twistyPlayerProp];
    }
  }

  #observer = new ResizeObserver((entries: ResizeObserverEntry[]) =>
    this.onResize(entries),
  );

  #lastObserverRect: DOMRectReadOnly | null = null;

  constructor(options?: {
    twistyPlayer?: TwistyPlayerV2;
    twistyPlayerProp?: TwistyPlayerAlgProp;
  }) {
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

    this.addCSS(twistyAlgEditorCSS);

    // TODO: What set of events should we register? `change`? `keydown`?
    this.#textarea.addEventListener("input", () => this.onInput());
    document.addEventListener("selectionchange", () =>
      this.onSelectionChange(),
    );

    if (options?.twistyPlayer) {
      this.twistyPlayer = options.twistyPlayer;
    }
    this.#twistyPlayerProp = options?.twistyPlayerProp ?? "algProp";

    this.#observer.observe(this.contentWrapper);
  }

  onResize(entries: ResizeObserverEntry[]): void {
    const rect = entries[0].contentRect;
    if (
      rect.height !== this.#lastObserverRect?.height ||
      rect.width !== this.#lastObserverRect?.width
    ) {
      this.#observer.unobserve(this.contentWrapper);
      this.resizeTextarea();
      requestAnimationFrame(() => {
        this.#observer.observe(this.contentWrapper);
      });
      this.#lastObserverRect = rect;
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

  #lastSelection: { start: number; end: number } | null = null;
  onSelectionChange(): void {
    if (
      document.activeElement !== this ||
      this.shadow.activeElement !== this.#textarea
    ) {
      return;
    }
    if (this.#twistyPlayerProp !== "algProp") {
      return;
    }
    // console.log(this.#textarea.selectionStart);
    const idx =
      this.#lastSelection?.start === this.#textarea.selectionStart &&
      this.#lastSelection?.end !== this.#textarea.selectionEnd
        ? this.#textarea.selectionEnd
        : this.#textarea.selectionStart;
    const dataUp = twistyAlgEditorCharSearch(this.#alg, {
      targetCharIdx: idx,
      numMovesSofar: 0,
    });
    this.#lastSelection = {
      start: this.#textarea.selectionStart,
      end: this.#textarea.selectionEnd,
    };
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

  get twistyPlayer(): TwistyPlayerV2 | null {
    return this.#twistyPlayer;
  }

  // TODO: spread out this impl over private methods instead of self-listeners.
  set twistyPlayer(twistyPlayer: TwistyPlayerV2 | null) {
    if (this.#twistyPlayer) {
      // TODO: support reassigment/clearing
      console.warn("twisty-player reassignment/clearing is not supported");
      return;
    }
    this.#twistyPlayer = twistyPlayer;
    if (!twistyPlayer) {
      return;
    }
    (async () => {
      this.algString = (await twistyPlayer.model.algProp.get()).alg.toString();
    })();

    this.addEventListener(
      "effectiveAlgChange",
      (e: CustomEvent<{ alg: Alg }>) => {
        try {
          this.#algProp?.set(e.detail.alg);
          // this.setAlgValidForPuzzle(true);
        } catch (e) {
          console.error("cannot set alg for puzzle", e);
          this.#algProp?.set(new Alg());
          // this.setAlgValidForPuzzle(false);
        }
      },
    );

    if (this.#twistyPlayerProp === "algProp") {
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
            // TODO: async issues
            (async () => {
              const moveStartTimestamp = (
                await twistyPlayer.model.indexerProp.get()
              ).indexToMoveStartTimestamp(e.detail.idx);
              const newTimestamp =
                moveStartTimestamp + (e.detail.isAtStartOfLeaf ? 250 : 0);
              twistyPlayer.model.timestampRequestProp.set(newTimestamp);
            })();
          } catch (e) {
            // console.error("cannot set idx", e);
            twistyPlayer.timestamp = "anchor";
          }
        },
      );

      // TODO: listen to puzzle prop?
      this.#twistyPlayer?.model.puzzleAlgProp.addFreshListener(
        (algWithIssues: AlgWithIssues) => {
          console.log(JSON.stringify(algWithIssues));
          if (algWithIssues.issues.errors.length === 0) {
            this.setAlgValidForPuzzle(true);
            const newAlg = algWithIssues.alg;
            if (!newAlg.isIdentical(Alg.fromString(this.algString))) {
              this.algString = newAlg.toString();
            }
          } else {
            this.setAlgValidForPuzzle(false);
          }
        },
      );

      twistyPlayer.model.currentLeavesProp.addFreshListener(
        (currentMoveInfo: CurrentMoveInfo) => {
          // TODO: take into account finishing moves.
          const currentMove = currentMoveInfo.currentMoves[0];
          console.log({ currentMove });
          if (currentMove) {
            this.highlightLeaf(currentMove.move as ExperimentalParsed<Move>);
            return;
          }
          // const moveStarting = currentMoveInfo.movesStarting[0];
          // console.log({ moveStarting });
          // if (moveStarting) {
          //   this.highlightLeaf(moveStarting.move as ExperimentalParsed<Move>);
          // }
        },
      );
    }
  }

  protected attributeChangedCallback(
    attributeName: string,
    _oldValue: string,
    newValue: string,
  ): void {
    switch (attributeName) {
      case ATTRIBUTE_FOR_TWISTY_PLAYER:
        const elem = document.getElementById(newValue);
        if (!elem) {
          console.warn(`${ATTRIBUTE_FOR_TWISTY_PLAYER}= elem does not exist`);
          return;
        }
        if (!(elem instanceof TwistyPlayerV2)) {
          // TODO: avoid assuming single instance of lib?
          console.warn(`${ATTRIBUTE_FOR_TWISTY_PLAYER}=is not a twisty-player`);
          return;
        }
        this.twistyPlayer = elem;
        return;
      case ATTRIBUTE_PLACEHOLDER:
        this.placeholder = newValue;
        return;
      case ATTRIBUTE_TWISTY_PLAYER_PROP:
        if (this.#twistyPlayer) {
          throw new Error("cannot set prop after twisty player");
        }
        this.#twistyPlayerProp = newValue as TwistyPlayerAlgProp;
        return;
    }
  }

  static get observedAttributes(): string[] {
    return [
      ATTRIBUTE_FOR_TWISTY_PLAYER,
      ATTRIBUTE_PLACEHOLDER,
      ATTRIBUTE_TWISTY_PLAYER_PROP,
    ];
  }
}

customElementsShim.define("twisty-alg-editor-v2", TwistyAlgEditorV2);
