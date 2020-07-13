export class CSSSource {
  constructor(private sourceText: string) {
    // TODO: Replace with adopted style sheets some day if we can.
    // const blob = new Blob([sourceText], {
    //   type: "text/utf8",
    // });
    // this.url = URL.createObjectURL(blob);
  }

  getAsString(): string {
    return this.sourceText;
  }
}

export class CSSManager {
  private map: Map<CSSSource, HTMLStyleElement> = new Map();
  constructor(private managedElem: ShadowRoot) {}

  // Add the source, if not already added.
  addSource(cssSource: CSSSource): void {
    if (this.map.get(cssSource)) {
      return;
    }

    const cssElem: HTMLStyleElement = document.createElement("style");
    cssElem.textContent = cssSource.getAsString();

    this.map.set(cssSource, cssElem);
    this.managedElem.appendChild(cssElem);
  }

  // Add the source, unless already .
  removeSource(cssSource: CSSSource): void {
    const cssElem = this.map.get(cssSource);
    if (!cssElem) {
      return;
    }
    this.managedElem.removeChild(cssElem);
    this.map.delete(cssSource);
  }
}
