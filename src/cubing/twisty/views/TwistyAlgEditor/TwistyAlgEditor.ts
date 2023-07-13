/**
 * Warning: the current implementation of <twisty-alg-editor> is *not good*,
 * but it is *good enough*. The important parts is that:
 *
 * - The editor can be used in apps without much effort.
 * - The editor handles alg validation and move highlighting *okay* when not
 *   connected to a `<twisty-player>`.
 * - The editor stays in sync if it's connected to a `<twisty-player>`.
 *
 * The current implementation still has some race conditions and edge cases. A
 * proper rewrite with a better model would be very welcome.
 */

import type { ExperimentalParsed } from "../../../alg";
import { Alg, Move, Pause } from "../../../alg";
import type { Parsed } from "../../../alg/parseAlg";
import type {
  AlgProp,
  AlgWithIssues,
} from "../../model/props/puzzle/state/AlgProp";
import type { CurrentLeavesSimplified } from "../../model/props/puzzle/state/CurrentLeavesSimplified";
import { ClassListManager } from "../ClassListManager";
import { ManagedCustomElement } from "../ManagedCustomElement";
import { customElementsShim } from "../node-custom-element-shims";
import { TwistyPlayer } from "../TwistyPlayer";
import { type HighlightInfo, TwistyAlgEditorModel } from "./model";
import { twistyAlgEditorCSS } from "./TwistyAlgEditor.css";

const ATTRIBUTE_FOR_TWISTY_PLAYER = "for-twisty-player";
const ATTRIBUTE_PLACEHOLDER = "placeholder";
const ATTRIBUTE_TWISTY_PLAYER_PROP = "twisty-player-prop";

type TwistyPlayerAlgProp = "alg" | "setupAlg";

const COMMENT_DELIMITER = "//";

function maybeParse(str: string): Alg | null {
  try {
    return Alg.fromString(str);
  } catch {
    return null;
  }
}

// If there is no occurence, the original string is returned in the first entry.
// If there is, the delimiter is included at the start of the second entry.
function splitBeforeOnFirstOccurrence(
  str: string,
  delimiter: string,
): [before: string, after: string] {
  const idx = str.indexOf(delimiter);
  if (idx === -1) {
    return [str, ""];
  }
  return [str.slice(0, idx), str.slice(idx)];
}

function replaceSmartQuotesOutsideComments(str: string): string {
  const linesOut = [];
  for (const line of str.split("\n")) {
    let [before, after] = splitBeforeOnFirstOccurrence(line, COMMENT_DELIMITER);
    before = before.replaceAll("’", "'");
    linesOut.push(before + after);
  }
  return linesOut.join("\n");
}

// Returns whether the paste was successful.
function pasteIntoTextArea(
  textArea: HTMLTextAreaElement,
  pastedText: string,
): void {
  const { value: oldValue } = textArea;
  const { selectionStart, selectionEnd } = textArea;

  const textPrecedingSelection = oldValue.slice(0, selectionStart);
  const textFollowingSelection = oldValue.slice(selectionEnd);

  // Does the last line end in a comment?
  // Note that we want the match to include "R U R'\n//hello there" but not "// hello there\nR U R'"
  const selectionStartsInExistingComment =
    textPrecedingSelection.match(/\/\/[^\n]*$/);
  const pasteCreatesStartingComment =
    oldValue[selectionStart - 1] === "/" && pastedText[0] === "/"; // Pasting "/ This is “weird”." at the end of "R U R' /"
  const pasteStartsWithCommentText =
    selectionStartsInExistingComment || pasteCreatesStartingComment;

  const pasteEndsWithComment = pastedText.match(/\/\/[^\n]*$/);

  // Replace smart quotes that are not in comments.
  let replacement = pastedText;
  if (pasteStartsWithCommentText) {
    const [before, after] = splitBeforeOnFirstOccurrence(pastedText, "\n");
    replacement = before + replaceSmartQuotesOutsideComments(after);
  } else {
    replacement = replaceSmartQuotesOutsideComments(pastedText);
  }

  /** Note: at this point, we would want to test which of the following produces
   * a valid alg:
   *
   * - No changes to `correctedPastedText`.
   * - Add a space prefix.
   * - Add a space suffix.
   *
   * However, the puzzle is not synchronously available to us, so we can't tell
   * whether pasting "U" before "R" should create "UR" (Megaminx) or "U R"
   * (3x3x3). So we optimistically assume the pasted alg is self-contained
   * (which is the case if it's a fully valid alg on its own) and try to perform
   * the latter directly.
   */

  const tryAddSpaceBefore =
    !pasteStartsWithCommentText &&
    selectionStart !== 0 && // Not at text start
    !["\n", " "].includes(replacement[0]) &&
    !["\n", " "].includes(oldValue[selectionStart - 1]); // Not at line start, no space before
  const tryAddSpaceAfter =
    !pasteEndsWithComment &&
    selectionEnd !== oldValue.length && // Not at text end
    !(["\n", " "] as (string | undefined)[]).includes(replacement.at(-1)) &&
    !["\n", " "].includes(oldValue[selectionEnd]); // Not at line end, no space after

  function adoptSpacingIfValid(prefix: string, suffix: string): boolean {
    const candidate = prefix + replacement + suffix;
    const valid = !!maybeParse(
      textPrecedingSelection + candidate + textFollowingSelection,
    );
    if (valid) {
      replacement = candidate;
    }
    return valid;
  }

  // Here, we try possible space insertions. We use `||` for short-circuit logic, to adopt the first valid one.
  (tryAddSpaceBefore && tryAddSpaceAfter && adoptSpacingIfValid(" ", " ")) || // Paste "R U R' U'" over " " in "F F'" to create "F R U R' U' F'"
    (tryAddSpaceBefore && adoptSpacingIfValid(" ", "")) || // Paste "U" after "R'" in "R' L'" to create "R' U L'"
    (tryAddSpaceAfter && adoptSpacingIfValid("", " ")); // Paste "U" before "L'" in "R' L'" to create "R' U L'"

  // TODO: use "select" or "preserve" (https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setRangeText#selectmode)
  textArea.setRangeText(replacement, selectionStart, selectionEnd, "end");
}

export const pasteIntoTextAreaForTesting = pasteIntoTextArea;

/** @category Other Custom Elements */
export class TwistyAlgEditor extends ManagedCustomElement {
  model = new TwistyAlgEditorModel();

  // #alg: Alg = new Alg();
  #textarea: HTMLTextAreaElement = document.createElement("textarea");
  #carbonCopy: HTMLDivElement = document.createElement("div");
  #carbonCopyPrefix: HTMLSpanElement = document.createElement("span");
  #carbonCopyHighlight: HTMLSpanElement = document.createElement("span");
  #carbonCopySuffix: HTMLSpanElement = document.createElement("span");

  // #textareaClassListManager: ClassListManager<"none" | "warning" | "error"> =
  //   new ClassListManager(this, "issue-", ["none", "warning", "error"]);

  #textareaClassListValidForPuzzleManager: ClassListManager<
    "none" | "warning" | "error"
  > = new ClassListManager(this, "valid-for-puzzle-", [
    "none",
    "warning",
    "error",
  ]);

  #twistyPlayer: TwistyPlayer | null = null;
  #twistyPlayerProp: TwistyPlayerAlgProp;
  get #algProp(): AlgProp | null {
    if (this.#twistyPlayer === null) {
      return null;
    } else {
      return this.#twistyPlayer.experimentalModel[this.#twistyPlayerProp];
    }
  }

  // Temporary Workaround for Twizzle Explorer
  debugNeverRequestTimestamp: boolean = false;

  constructor(options?: {
    twistyPlayer?: TwistyPlayer;
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
    this.#carbonCopySuffix.classList.add("suffix");
    this.#carbonCopy.appendChild(this.#carbonCopySuffix);

    this.#textarea.placeholder = "Alg";
    // Prevent iOS from defaulting to smart quotes.
    this.#textarea.setAttribute("spellcheck", "false");

    this.addCSS(twistyAlgEditorCSS);

    // TODO: What set of events should we register? `change`? `keydown`?
    this.#textarea.addEventListener("input", () => {
      this.#onInputHasFired = true;
      this.onInput();
    });
    this.#textarea.addEventListener("blur", () => this.onBlur());
    document.addEventListener("selectionchange", () =>
      this.onSelectionChange(),
    );

    if (options?.twistyPlayer) {
      this.twistyPlayer = options.twistyPlayer;
    }
    this.#twistyPlayerProp = options?.twistyPlayerProp ?? "alg";

    if (options?.twistyPlayerProp === "alg") {
      this.model.leafToHighlight.addFreshListener(
        (highlightInfo: HighlightInfo | null) => {
          if (highlightInfo) {
            this.highlightLeaf(highlightInfo.leafInfo.leaf);
          }
        },
      );
    }
  }

  connectedCallback(): void {
    this.#textarea.addEventListener("paste", (e) => {
      const text = e.clipboardData?.getData("text");
      if (text) {
        pasteIntoTextArea(this.#textarea, text);
        e.preventDefault();
        this.onInput();
      }
    });
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

  #onInputHasFired = false;
  onInput(): void {
    this.#carbonCopyHighlight.hidden = true;
    this.highlightLeaf(null);

    // TODO: This is a hack so that the you don't get a warning when the cursor
    // is after the space while typing `R U`. It would be nice to have something
    // cursor-aware that can also ignore whitespace warnings (or other syntax
    // errors due to normal input) adjacent to the cursor when it's in the
    // middle, but this is suffuciently useful for now.
    const endTrimmed = this.#textarea.value.trimEnd();
    this.model.valueProp.set(endTrimmed);
    this.#algProp?.set(endTrimmed);
  }

  async onSelectionChange(): Promise<void> {
    if (
      document.activeElement !== this ||
      this.shadow.activeElement !== this.#textarea
    ) {
      return;
    }
    if (this.#twistyPlayerProp !== "alg") {
      return;
    }

    const { selectionStart, selectionEnd } = this.#textarea;
    this.model.selectionProp.set({
      selectionStart,
      selectionEnd,
    });
  }

  async onBlur(): Promise<void> {
    // TODO: Figure out how not to make the cursor jump.
    // const parsed = Alg.fromString(this.algString);
    // this.algString = parsed.toString();
    // const [currentLeavesSimplified, indexer] = await Promise.all([
    //   this.#twistyPlayer!.model.currentLeavesSimplifiedProp.get(),
    //   this.#twistyPlayer!.model.indexerProp.get(),
    // ]);
    // const leaf = indexer.getAnimLeaf(currentLeavesSimplified.stateIndex);
    // this.highlightLeaf(leaf as Parsed<Move | Pause> | null);
  }

  setAlgIssueClassForPuzzle(issues: "none" | "warning" | "error") {
    this.#textareaClassListValidForPuzzleManager.setValue(issues);
  }

  // `white-space: pre;` mostly matches the formatting of the `<textarea>`, *except* when we end with a newline.
  // So we add an space to ensure that there is a character on the final line (that is very unlikely to trigger extra line wrapping).
  #padSuffix(s: string): string {
    return s.endsWith("\n") ? `${s} ` : s;
  }

  #highlightedLeaf: ExperimentalParsed<Move | Pause> | null = null;
  // TODO: support a primary highlighted move and secondary ones.
  highlightLeaf(leaf: ExperimentalParsed<Move | Pause> | null): void {
    if (this.#twistyPlayerProp !== "alg") {
      return;
    }
    if (leaf === null) {
      this.#carbonCopyPrefix.textContent = "";
      this.#carbonCopyHighlight.textContent = "";
      this.#carbonCopySuffix.textContent = this.#padSuffix(
        this.#textarea.value,
      );
      return;
    }
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
    this.#carbonCopySuffix.textContent = this.#padSuffix(
      this.#textarea.value.slice(leaf.endCharIndex),
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
    if (!twistyPlayer) {
      return;
    }
    (async () => {
      this.algString = this.#algProp
        ? (await this.#algProp.get()).alg.toString()
        : "";
    })();

    if (this.#twistyPlayerProp === "alg") {
      // this.model.leafToHighlight.addFreshListener(
      //   this.highlightLeaf.bind(this),
      // );

      // TODO: listen to puzzle prop?
      this.#twistyPlayer?.experimentalModel.puzzleAlg.addFreshListener(
        (algWithIssues: AlgWithIssues) => {
          // console.log(JSON.stringify(algWithIssues));
          if (algWithIssues.issues.errors.length === 0) {
            this.setAlgIssueClassForPuzzle(
              // TODO: Allow trailing spaces.
              algWithIssues.issues.warnings.length === 0 ? "none" : "warning",
            );
            const newAlg = algWithIssues.alg;
            const oldAlg = Alg.fromString(this.algString);
            if (!newAlg.isIdentical(oldAlg)) {
              this.algString = newAlg.toString();
              this.onInput();
            } else {
              // this.model.algInputProp.set(oldAlg);
            }
          } else {
            this.setAlgIssueClassForPuzzle("error");
          }
        },
      );

      this.model.leafToHighlight.addFreshListener(
        async (highlightInfo: HighlightInfo | null) => {
          if (highlightInfo === null) {
            return;
          }
          // TODO: This indexer can be out of date!
          const [indexer, timestampRequest] = await Promise.all([
            await twistyPlayer.experimentalModel.indexer.get(),
            await twistyPlayer.experimentalModel.timestampRequest.get(),
          ]);
          if (timestampRequest === "auto" && !this.#onInputHasFired) {
            return;
          }
          const moveStartTimestamp = indexer.indexToMoveStartTimestamp(
            highlightInfo.leafInfo.idx,
          );
          const duration = indexer.moveDuration(highlightInfo.leafInfo.idx);

          let newTimestamp: number;
          switch (highlightInfo.where) {
            case "before": {
              newTimestamp = moveStartTimestamp;
              break;
            }
            case "start":
            case "inside": {
              newTimestamp = moveStartTimestamp + duration / 4;
              break;
            }
            case "end":
            case "after": {
              newTimestamp = moveStartTimestamp + duration;
              break;
            }
            default:
              console.log("invalid where");
              throw new Error("Invalid where!");
          }
          if (!this.debugNeverRequestTimestamp) {
            twistyPlayer.experimentalModel.timestampRequest.set(newTimestamp);
          }
        },
      );

      twistyPlayer.experimentalModel.currentLeavesSimplified.addFreshListener(
        async (currentLeavesSimplified: CurrentLeavesSimplified) => {
          const indexer = await twistyPlayer.experimentalModel.indexer.get();
          const leaf = indexer.getAnimLeaf(currentLeavesSimplified.stateIndex);
          this.highlightLeaf(leaf as Parsed<Move | Pause> | null);
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
      case ATTRIBUTE_FOR_TWISTY_PLAYER: {
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
        return;
      }
      case ATTRIBUTE_PLACEHOLDER: {
        this.placeholder = newValue;
        return;
      }
      case ATTRIBUTE_TWISTY_PLAYER_PROP: {
        if (this.#twistyPlayer) {
          console.log("cannot set prop");
          throw new Error("cannot set prop after twisty player");
        }
        this.#twistyPlayerProp = newValue as TwistyPlayerAlgProp;
        return;
      }
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

customElementsShim.define("twisty-alg-editor", TwistyAlgEditor);
declare global {
  interface HTMLElementTagNameMap {
    "twisty-alg-editor": TwistyAlgEditor;
  }
}
