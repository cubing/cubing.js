// Workarounds for `node`.
// TODO: figure out how to remove this.

// This stub does not need to be callable, just constructable to satisfy the `node` loader.
class HTMLElementStub {}

let HTMLElementShim: typeof HTMLElement;
if (globalThis.HTMLElement) {
  HTMLElementShim = globalThis.HTMLElement;
} else {
  HTMLElementShim = HTMLElementStub as any;
}

export { HTMLElementShim };

class CustomElementsStub {
  define(): void {
    // nothing
  }
}

let customElementsShim: typeof customElements;

if (globalThis.customElements) {
  customElementsShim = globalThis.customElements;
} else {
  customElementsShim = new CustomElementsStub() as any;
}

export { customElementsShim };

let cssStyleSheetShim: typeof CSSStyleSheet;

class CSSStyleSheetStub {
  replaceSync(): void {
    // nothing
  }
}

if (globalThis.CSSStyleSheet) {
  cssStyleSheetShim = globalThis.CSSStyleSheet;
} else {
  cssStyleSheetShim = CSSStyleSheetStub as any;
}

export { cssStyleSheetShim };
