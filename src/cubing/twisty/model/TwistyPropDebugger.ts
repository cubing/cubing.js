import type { Alg } from "../../alg";
import { countMoves } from "../../notation";
import { ClassListManager } from "../old/dom/element/ClassListManager";
import {
  CSSSource,
  ManagedCustomElement,
} from "../old/dom/element/ManagedCustomElement";
import { customElementsShim } from "../old/dom/element/node-custom-element-shims";
import type { TwistyPlayerV2 } from "../views/TwistyPlayerV2";
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
  constructor(private name: string, public twistyProp: TwistyPropParent<any>) {
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
  grid-template-rows: 1.5em 3.5em;
  max-width: 20em;

  border: 1px solid #000;
  overflow: hidden;
  box-sizing: border-box;
}

.wrapper > :nth-child(2) {
  border-top: 1px solid #000;
  width: 100%;
  height: 3.5em;
  overflow-wrap: anywhere;
  padding: 0.25em;
}

.wrapper > span {
  padding: 0.25em;
  max-width: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.wrapper.highlight-grandchild-or-further,
.wrapper.highlight-grandparent-or-further                { background: rgba(0, 0, 0, 0.2); line-height: 1em; }
.wrapper.highlight-grandparent-or-further > span::before { content: "⏬ "; margin-right: 0.1em; }

.wrapper.highlight-child,
.wrapper.highlight-parent                { background: rgba(0, 0, 0, 0.6); line-height: 1em; color: white; }
.wrapper.highlight-parent > span::before { content: "🔽 "; margin-right: 0.1em; }

.wrapper.highlight-self                { background: rgba(0, 0, 0, 0.8); line-height: 1em; color: white; }
.wrapper.highlight-self > span::before { content: "⭐️ "; margin-right: 0.1em; }

.wrapper.highlight-child > span::before { content: "🔼 "; margin-right: 0.1em; }

.wrapper.highlight-grandchild-or-further > span::before { content: "⏫ "; margin-right: 0.1em; }
    `),
    );
  }

  async onPropRaw(): Promise<void> {
    // TODO: Animate `opacity` on overlapping elements for better perf.
    this.valueElem?.animate(
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
          const numMoves = countMoves(value.alg);
          str += ` (${numMoves} moves)`;
          if (numMoves > 0) {
            str += `: ${truncateAlgForDisplay(value.alg)}`;
          }
        }
        if ((value.issues as AlgIssues).warnings.length > 0) {
          str += ` ⚠️ ${value.issues.warnings[0]}`;
        }
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
    this.valueElem?.animate(
      [
        // keyframes
        { background: "rgba(90, 160, 253, 0.4)" },
        { background: "transparent" },
      ],
      {
        duration: 500,
      },
    );
  }

  #highlightClassManager = new ClassListManager(this, "highlight-", [
    "none",
    "grandparent-or-further",
    "parent",
    "self",
    "child",
    "grandchild-or-further",
  ]);

  setHighlight(
    highlightType:
      | "none"
      | "grandparent-or-further"
      | "parent"
      | "self"
      | "child"
      | "grandchild-or-further",
  ): void {
    this.#highlightClassManager.setValue(highlightType);
  }
}

customElementsShim.define("twisty-prop-debugger", TwistyPropDebugger);

export class TwistyPlayerDebugger extends ManagedCustomElement {
  constructor(private player: TwistyPlayerV2) {
    super({ mode: "open" });
  }

  connectedCallback(): void {
    this.addCSS(
      new CSSSource(`
.wrapper {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12em, 1fr));
}
`),
    );

    for (const [key, value] of Object.entries(this.player.model)) {
      if (key.endsWith("Prop")) {
        const twistyPropDebugger = this.addElement(
          new TwistyPropDebugger(splitFieldName(key), value),
        );
        this.twistyPropDebuggers.set(value, twistyPropDebugger);
        this.parentPropElems.set(twistyPropDebugger, new Set());
        this.childPropElems.set(twistyPropDebugger, new Set());

        twistyPropDebugger.addEventListener("click", () => {
          this.highlightFamilyTree(twistyPropDebugger);
        });
      }
    }

    for (const twistyPropDebuggerParent of this.twistyPropDebuggers.values()) {
      for (const childProp of twistyPropDebuggerParent.twistyProp.debugGetChildren()) {
        const childElem = this.twistyPropDebuggers.get(childProp)!;
        if (!childElem) {
          throw new Error("inconsistency!");
        }
        this.parentPropElems.get(childElem)!.add(twistyPropDebuggerParent);
        this.childPropElems.get(twistyPropDebuggerParent)!.add(childElem);
      }
    }
  }

  twistyPropDebuggers: Map<TwistyPropParent<any>, TwistyPropDebugger> =
    new Map();

  parentPropElems: Map<TwistyPropDebugger, Set<TwistyPropDebugger>> = new Map();
  childPropElems: Map<TwistyPropDebugger, Set<TwistyPropDebugger>> = new Map();

  highlightFamilyTree(prop: TwistyPropDebugger) {
    for (const propToClear of this.twistyPropDebuggers.values()) {
      propToClear.setHighlight("none");
    }

    prop.setHighlight("self");

    const children = this.childPropElems.get(prop)!;
    for (const descendant of this.getDescendants(prop)) {
      descendant.setHighlight(
        children.has(descendant) ? "child" : "grandchild-or-further",
      );
    }

    const parents = this.parentPropElems.get(prop)!;
    for (const ancestor of this.getAncestors(prop)) {
      ancestor.setHighlight(
        parents.has(ancestor) ? "parent" : "grandparent-or-further",
      );
    }
  }

  getDescendants(
    prop: TwistyPropDebugger,
    accumulator: Set<TwistyPropDebugger> = new Set(),
  ): Set<TwistyPropDebugger> {
    for (const child of this.childPropElems.get(prop) ?? []) {
      if (!accumulator.has(child)) {
        accumulator.add(child);
        this.getDescendants(child, accumulator);
      }
    }
    return accumulator;
  }

  getAncestors(
    prop: TwistyPropDebugger,
    accumulator: Set<TwistyPropDebugger> = new Set(),
  ): Set<TwistyPropDebugger> {
    for (const child of this.parentPropElems.get(prop) ?? []) {
      if (!accumulator.has(child)) {
        accumulator.add(child);
        this.getAncestors(child, accumulator);
      }
    }
    return accumulator;
  }
}

customElementsShim.define("twisty-player-debugger", TwistyPlayerDebugger);
