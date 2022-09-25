import type { Alg } from "../../../../../cubing/alg";
import { experimentalCountMoves } from "../../../../../cubing/notation";
import { ClassListManager } from "../../../../../cubing/twisty/views/ClassListManager";
import {
  CSSSource,
  ManagedCustomElement,
} from "../../../../../cubing/twisty/views/ManagedCustomElement";
import { customElementsShim } from "../../../../../cubing/twisty/views/node-custom-element-shims";
import type { TwistyPlayer } from "../../../../../cubing/twisty/views/TwistyPlayer";
import type { AlgIssues } from "../../../../../cubing/twisty/model/props/puzzle/state/AlgProp";
import { TwistyPropParent } from "../../../../../cubing/twisty/model/props/TwistyProp";

function truncateAlgForDisplay(alg: Alg): string {
  let str = alg.toString();
  if (str.length < 50) {
    return str;
  }
  str = str.slice(0, 50);
  const lastSpace = str.lastIndexOf(" ");
  if (lastSpace !== -1) {
    str = `${str.slice(0, lastSpace)}…`;
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
      new CSSSource(
        `

.wrapper {
  font-family: Ubuntu, sans-serif;
  display: grid;
  grid-template-rows: 1.5em 3.5em;
  max-width: 20em;

  border: 2px solid #ddd;
  overflow: hidden;
  box-sizing: border-box;

  cursor: pointer;
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
  line-height: 1em;
}

.wrapper.highlight-de-emphasize {
  opacity: 0.25;
}

/* .wrapper:hover > span::before { content: "⭐️ "; margin-right: 0.1em; } */

.wrapper.highlight-grandchild-or-further,
.wrapper.highlight-grandparent-or-further                { background: rgba(0, 0, 0, 0.2); }
.wrapper.highlight-grandparent-or-further > span::before { content: "⏬ "; margin-right: 0.1em; }

.wrapper.highlight-child,
.wrapper.highlight-parent                { background: rgba(0, 0, 0, 0.6); color: white; }
.wrapper.highlight-parent > span::before { content: "🔽 "; margin-right: 0.1em; }

.wrapper.highlight-self                { background: rgba(0, 0, 0, 0.8); color: white; }
.wrapper.highlight-self > span::before { content: "⭐️ "; margin-right: 0.1em; }

.wrapper.highlight-child > span::before { content: "🔼 "; margin-right: 0.1em; }

.wrapper.highlight-grandchild-or-further > span::before { content: "⏫ "; margin-right: 0.1em; }

.wrapper:hover {
  border: 2px solid #000;
  opacity: 1;
}

.wrapper.highlight-self:hover {
  /* border: 2px solid #f00; */
}
.wrapper.highlight-self:hover > span::before { content: "🌟 "; margin-right: 0.1em; }

    `,
      ),
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
        return v instanceof Object && "alg" in v && "issues" in v;
      } catch (e) {
        return false;
      }
    }

    let str: string;
    try {
      if (typeof value === "undefined") {
        str = "(undefined)";
      } else if (isAlgIssues(value)) {
        const typedAlgIssues = value.issues as AlgIssues;
        str = "Alg";
        if (typedAlgIssues.errors.length > 0) {
          str += ` 🚨 ${typedAlgIssues.errors[0]}`;
        } else {
          const numMoves = experimentalCountMoves(value.alg);
          str += ` (${numMoves} moves)`;
          if (numMoves > 0) {
            str += `: ${truncateAlgForDisplay(value.alg)}`;
          }
        }
        if (typedAlgIssues.warnings.length > 0) {
          str += ` ⚠️ ${typedAlgIssues.warnings[0]}`;
        }
      } else {
        const str1 = JSON.stringify(value);
        if (typeof str1 === "undefined") {
          if (value.name) {
            str = `${value.name as string} (constructor)`;
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
    "de-emphasize",
    "grandparent-or-further",
    "parent",
    "self",
    "child",
    "grandchild-or-further",
  ]);

  setHighlight(
    highlightType:
      | "de-emphasize"
      | "grandparent-or-further"
      | "parent"
      | "self"
      | "child"
      | "grandchild-or-further"
      | null,
  ): void {
    if (highlightType !== null) {
      this.#highlightClassManager.setValue(highlightType);
    } else {
      this.#highlightClassManager.clearValue();
    }
  }
}

customElementsShim.define("twisty-prop-debugger", TwistyPropDebugger);

export class TwistyPlayerDebugger extends ManagedCustomElement {
  constructor(private player: TwistyPlayer) {
    super({ mode: "open" });
  }

  connectedCallback(): void {
    this.addCSS(
      new CSSSource(
        `
.wrapper {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12em, 1fr));
}

twisty-prop-debugger.hidden {
  /* display: none; */
}

twisty-prop-debugger.first-in-group,
twisty-prop-debugger.highlighted {
  /* grid-column-start: 1; */
}

twisty-prop-debugger.highlighted {
  /* grid-column: 1 / -1; */
  /* margin: 1em 0; */
}
`,
      ),
    );

    for (const [key, value] of Object.entries(
      this.player.experimentalModel,
    ).concat(Object.entries(this.player.experimentalModel.twistySceneModel))) {
      if (value instanceof TwistyPropParent) {
        const twistyPropDebugger = this.addElement(
          new TwistyPropDebugger(key, value),
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

  currentHighlighted: TwistyPropDebugger | null = null;
  highlightFamilyTree(prop: TwistyPropDebugger) {
    if (this.currentHighlighted === prop) {
      for (const propToClear of this.twistyPropDebuggers.values()) {
        propToClear.setHighlight(null);
        propToClear.classList.remove("hidden");
        propToClear.classList.remove("first-in-group");
        propToClear.classList.remove("highlighted");
      }
      this.currentHighlighted = null;
      return;
    }

    for (const propToClear of this.twistyPropDebuggers.values()) {
      propToClear.setHighlight("de-emphasize");
      propToClear.classList.add("hidden");
      propToClear.classList.remove("first-in-group");
      propToClear.classList.remove("highlighted");
    }

    prop.setHighlight("self");
    prop.classList.remove("hidden");
    prop.classList.add("highlighted");
    this.currentHighlighted = prop;

    const children = this.childPropElems.get(prop)!;
    let firstInGroup: boolean = true;
    for (const descendant of this.getDescendants(prop)) {
      descendant.setHighlight(
        children.has(descendant) ? "child" : "grandchild-or-further",
      );
      descendant.classList.remove("hidden");
      if (firstInGroup) {
        descendant.classList.add("first-in-group");
        firstInGroup = false;
      }
    }

    const parents = this.parentPropElems.get(prop)!;
    firstInGroup = true;
    for (const ancestor of this.getAncestors(prop)) {
      ancestor.setHighlight(
        parents.has(ancestor) ? "parent" : "grandparent-or-further",
      );
      ancestor.classList.remove("hidden");
      if (firstInGroup) {
        ancestor.classList.add("first-in-group");
        firstInGroup = false;
      }
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
