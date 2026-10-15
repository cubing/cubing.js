import type { Alg } from "./Alg.ts";
import type { AlgNode } from "./alg-nodes/index.ts";
import { endCharIndexKey, startCharIndexKey } from "./parseAlg.ts";

export const NODEJS_UTIL_INSPECT_CUSTOM = Symbol.for(
  "nodejs.util.inspect.custom",
);

const NODE_DEFAULT_STRING_COLOR = "green";
const DE_EMPHASIZED = "gray";

export function formatForCustomInspect(
  className: string,
  soleParameterQuotedString: string,
  annotation?: string,
) {
  const { styleText } = globalThis.process.getBuiltinModule("node:util");
  const annotationPart = (() => {
    if (annotation) {
      return ` ${styleText(DE_EMPHASIZED, "/* with parse data */")}`;
    }
    return "";
  })();
  return `${className}(${styleText(NODE_DEFAULT_STRING_COLOR, soleParameterQuotedString)}${annotationPart})`;
}

export function formatForCustomInspectWithParseDataAnnotation(
  className: string,
  soleParameterQuotedString: string,
  value: Alg | AlgNode,
) {
  const annotation = (() => {
    if (startCharIndexKey in value || endCharIndexKey in value) {
      if (startCharIndexKey in value !== endCharIndexKey in value) {
        console.warn(
          "Encountered an alg with start char info but no end char info. `cubing.js` should never produce this by itself.",
        );
      }
      return "with parse data";
    }
    return "";
  })();
  return formatForCustomInspect(
    className,
    soleParameterQuotedString,
    annotation,
  );
}
