// Workarounds for `node`.
// TODO: figure out how to remove this.

// This stub does not need to be callable, just constructable to satisfy the `node` loader.
class HTMLElementStub {}

let HTMLElementShim: typeof HTMLElement;
if (globalThis.HTMLElement) {
  HTMLElementShim = HTMLElement;
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
  customElementsShim = customElements;
} else {
  customElementsShim = new CustomElementsStub() as any;
}

export { customElementsShim };
