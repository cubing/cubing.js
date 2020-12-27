// Note: this file exists so that `parse` doesn't show up for autocompletion (by
// avoiding a `parser-pegjs.d.ts` file that exports `parse`.)

import { AlgJSON } from "../json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parse } from "./parser-pegjs";

const pegParseAlgJSON: (s: string) => AlgJSON = parse;

export { pegParseAlgJSON };
