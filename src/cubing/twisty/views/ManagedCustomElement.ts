import {
  customElementsShim,
  HTMLElementShim,
} from "./node-custom-element-shims";

// - Wrapped element
//   - Shadow root
//     - Content wrapper
export class ManagedCustomElement extends HTMLElementShim {
  public readonly shadow: ShadowRoot; // TODO: hide this
  public readonly contentWrapper: HTMLDivElement; // TODO: can we get rid of this wrapper?

  constructor(options?: { mode?: "open" | "closed" }) {
    super();
    this.shadow = this.attachShadow({ mode: options?.mode ?? "closed" });

    this.contentWrapper = document.createElement("div");
    this.contentWrapper.classList.add("wrapper");
    this.shadow.appendChild(this.contentWrapper);
  }

  // Add the source, if not already added.
  // Returns the existing if it's already on the element.
  protected addCSS(cssSource: CSSStyleSheet): void {
    this.shadow.adoptedStyleSheets.push(cssSource);
  }

  protected removeCSS(cssSource: CSSStyleSheet) {
    const cssIndex = this.shadow.adoptedStyleSheets.indexOf(cssSource);
    if (typeof cssIndex !== "undefined") {
      this.shadow.adoptedStyleSheets.splice(cssIndex, cssIndex + 1);
    }
  }

  public addElement<T extends Node>(element: T): T {
    return this.contentWrapper.appendChild(element);
  }

  public prependElement<T extends Node>(element: T): void {
    this.contentWrapper.prepend(element);
  }

  public removeElement<T extends Node>(element: T): T {
    return this.contentWrapper.removeChild(element);
  }
}

customElementsShim.define(
  "twisty-managed-custom-element",
  ManagedCustomElement,
);
