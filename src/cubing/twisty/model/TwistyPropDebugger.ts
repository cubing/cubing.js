import type { Alg } from "../../alg";
import { countMoves } from "../../notation";
import {
  CSSSource,
  ManagedCustomElement,
} from "../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../old/dom/element/node-custom-element-shims";
import type { AlgIssues } from "./depth-0/AlgProp";
import type { TwistyPropParent } from "./TwistyProp";

export function splitFieldName(s: string): string {
  let out = "";
  for (const c of s.slice(0, -4)) {
    if (c.toUpperCase() === c && out.slice(-1)[0] !== "3") {
      out += " ";
    }
    out += c.toLowerCase();
  }
  return out;
}

function truncateAlgForDisplay(alg: Alg): string {
  let str = alg.toString();
  if (str.length < 50) {
    return str;
  }
  str = str.slice(0, 50);
  const lastSpace = str.lastIndexOf(" ");
  if (lastSpace !== -1) {
    str = str.slice(0, lastSpace) + "…";
  }
  return str;
}

export class TwistyPropDebugger extends ManagedCustomElement {
  constructor(private name: string, private twistyProp: TwistyPropParent<any>) {
    super();
  }

  valueElem: HTMLElement | null = null;

  connectedCallback(): void {
    const span = document.createElement("span");
    span.textContent = this.name;
    this.contentWrapper.append(span);

    this.valueElem = this.contentWrapper.appendChild(
      document.createElement("div"),
    );
    this.twistyProp.addRawListener(this.onPropRaw.bind(this));
    this.twistyProp.addFreshListener(this.onProp.bind(this));

    this.addCSS(
      new CSSSource(`

.wrapper {
  font-family: Ubuntu, sans-serif;
  display: grid;
  grid-template-rows: 1.2em 3.5em;
  max-width: 20em;

  border: 1px solid #000;
  overflow: hidden;
  padding: 0.25em;
  box-sizing: border-box;
}

.wrapper > * {
  border-top: 1px solid #000;
  width: 100%;
  height: 3.5em;
  overflow-wrap: anywhere;
}

.wrapper > span {
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
}
    `),
    );
  }

  async onPropRaw(): Promise<void> {
    // TODO: Animate `opacity` on overlapping elements for better perf.
    this.animate(
      [
        // keyframes
        { background: "rgba(244, 133, 66, 0.4)" },
        { background: "transparent" },
      ],
      {
        duration: 500,
      },
    );
  }

  async onProp(value: any): Promise<void> {
    // console.log("onProp", value, this.valueElem, JSON.stringify(value));

    function isAlgIssues(v: any): boolean {
      try {
        return "alg" in v && "issues" in v;
      } catch (e) {
        return false;
      }
    }

    let str: string;
    try {
      if (typeof value === "undefined") {
        str = "(undefined)";
      } else if (isAlgIssues(value)) {
        str = `Alg`;
        if ((value.issues as AlgIssues).errors.length > 0) {
          str += ` 🚨 ${value.issues.errors[0]}`;
        } else {
          str += ` (${countMoves(value.alg)} moves): ${truncateAlgForDisplay(
            value.alg,
          )}`;
        }
        if ((value.issues as AlgIssues).warnings.length > 0) {
          str += ` ⚠️ ${value.issues.warnings[0]}`;
        }
        // str = JSON.stringify({
        //   alg: value.alg.toString(),
        //   issues: value.issues,
        // }).slice(0, 100);
      } else {
        const str1 = JSON.stringify(value);
        if (typeof str1 === "undefined") {
          if (value.name) {
            str = `${value.name} (constructor)`;
          } else {
            str = "(undefined)";
          }
        } else {
          str = str1.slice(0, 100);
        }
      }
    } catch (e) {
      str = "(can't be serialized)";
    }

    if (this.valueElem) {
      this.valueElem.textContent = str;
    }

    // TODO: Animate `opacity` on overlapping elements for better perf.
    this.contentWrapper.animate(
      [
        // keyframes
        { background: "rgba(140, 190, 250)" },
        { background: "transparent" },
      ],
      {
        duration: 500,
      },
    );
  }
}

customElementsShim.define("twisty-prop-debugger", TwistyPropDebugger);
