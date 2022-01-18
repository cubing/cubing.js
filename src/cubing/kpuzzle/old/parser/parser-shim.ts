// Note: this file exists so that `parse` doesn't show up for autocompletion (by
// avoiding a `parser-pegjs.d.ts` file that exports `parse`.)

import type { KPuzzleDefinition } from "../definition_types";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parse } from "./parser-peggy";

const pegParseKPuzzleDefinition: (s: string) => KPuzzleDefinition = parse;

export { pegParseKPuzzleDefinition };
