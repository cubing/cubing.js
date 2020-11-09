// Note: this file exists so that `parse` doesn't show up for autocompletion (by
// avoiding a `parser-pegjs.d.ts` file that exports `parse`.)
export { parse as pegParseKPuzzleDefinition } from "./parser-pegjs";
