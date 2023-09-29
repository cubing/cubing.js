import { Alg } from "../../../alg";
import { globalSafeDocument } from "../document";

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
function sliceBeforeFirstOccurrence(
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
    let [before, after] = sliceBeforeFirstOccurrence(line, COMMENT_DELIMITER);
    before = before.replaceAll("’", "'");
    linesOut.push(before + after);
  }
  return linesOut.join("\n");
}

export function pasteIntoTextArea(
  textArea: HTMLTextAreaElement,
  pastedText: string,
): void {
  const { value: oldValue } = textArea;
  const { selectionStart, selectionEnd } = textArea;

  const textPrecedingSelection = oldValue.slice(0, selectionStart);
  const textFollowingSelection = oldValue.slice(selectionEnd);

  pastedText = pastedText.replaceAll("\r\n", "\n");

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
    const [before, after] = sliceBeforeFirstOccurrence(pastedText, "\n");
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

  // `execCommand` is under-specced and deprecated, but it's more likely to allow undo and preserve history.
  const execCommandSuccess = globalSafeDocument?.execCommand(
    "insertText",
    false,
    replacement,
  );
  if (!execCommandSuccess) {
    // TODO: use "select" or "preserve" (https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setRangeText#selectmode)
    textArea.setRangeText(replacement, selectionStart, selectionEnd, "end");
  }
}
