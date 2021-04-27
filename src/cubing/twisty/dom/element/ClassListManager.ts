import type { ManagedCustomElement } from "./ManagedCustomElement";

export class ClassListManager<SuffixType extends string> {
  #currentClassName: string | null = null;
  // The prefix should ideally end in a dash.
  constructor(
    private elem: ManagedCustomElement,
    private prefix: string,
    private validSuffixes: SuffixType[],
  ) {}

  // Does nothing if there was no value.
  clearValue(): void {
    if (this.#currentClassName) {
      this.elem.contentWrapper.classList.remove(this.#currentClassName);
    }
    this.#currentClassName = null; // TODO: add test for this behaviour.
  }

  // Returns if the value changed
  setValue(suffix: SuffixType): boolean {
    if (!this.validSuffixes.includes(suffix)) {
      throw new Error(`Invalid suffix: ${suffix}`);
    }
    const newClassName = `${this.prefix}${suffix}`;
    const changed = this.#currentClassName !== newClassName;
    if (changed) {
      this.clearValue();
      this.elem.contentWrapper.classList.add(newClassName);
      this.#currentClassName = newClassName;
    }
    return changed;
  }
}
