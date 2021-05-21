import { Alg, Unit } from "../../../cubing/alg";
import type { Parsed } from "../../../cubing/alg/parse";
import { extract } from "./extractor";

const algElem = document.querySelector("#alg") as HTMLTextAreaElement;
const inspectorElem = document.querySelector("#inspector") as HTMLPreElement;

function pointyLen(n: number): string {
  if (n < 2) {
    return Array(n).fill("␣").join("");
  }
  return "└" + new Array(n - 2).fill("─").join("") + "┘";
}

function updateInspector(s: string): void {
  const singleLineS = s.replace("\n", "⏎");
  inspectorElem.textContent = ""; //.padStart(12, " ") + singleLineS;
  try {
    const parsed = Alg.fromString(s);
    for (const v of extract(parsed)) {
      console.log(v);
      const parsed = v as Parsed<Alg | Unit>;
      inspectorElem.textContent += "\n";
      inspectorElem.textContent += ("" + v.constructor.name + ":").padStart(
        12,
        " ",
      );
      inspectorElem.textContent += new Array(parsed.startCharIndex)
        .fill(" ")
        .join("");
      inspectorElem.textContent += singleLineS.slice(
        parsed.startCharIndex,
        parsed.endCharIndex,
      );
      inspectorElem.textContent += "\n";
      inspectorElem.textContent += "".padEnd(12, " ");
      inspectorElem.textContent += new Array(parsed.startCharIndex)
        .fill(" ")
        .join("");
      inspectorElem.textContent += pointyLen(
        parsed.endCharIndex - parsed.startCharIndex,
      );
    }
  } catch (e) {
    console.error(e);
    inspectorElem.textContent += "\n--------\nERROR:\n" + e;
  }
}

algElem.addEventListener("input", () => updateInspector(algElem.value));

algElem.textContent = "((5, -24234) R++)' / [ UR1+  , F2 ] ";
updateInspector(algElem.value);
