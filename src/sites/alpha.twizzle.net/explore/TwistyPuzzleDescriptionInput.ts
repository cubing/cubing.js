// const sections = ["f", "v", "e"];

export class TwistyPuzzleDescriptionInput extends HTMLElement {
  sectionElems: Record<string, HTMLElement> = {};
  inputF = this.querySelector("input.f") as HTMLInputElement;
  inputV = this.querySelector("input.v") as HTMLInputElement;
  connectedCallback() {
    for (const input of [this.inputF, this.inputV]) {
      input.addEventListener("input", () => {
        this.dispatchPuzzleDescription();
      });
    }
  }

  dispatchPuzzleDescription() {
    const descriptionString = `c f ${this.inputF.value} v ${this.inputV.value}`;
    this.dispatchEvent(
      new CustomEvent("puzzle-change", {
        detail: {
          descriptionString,
        },
      }),
    );
  }
}

customElements.define(
  "twisty-puzzle-description-input",
  TwistyPuzzleDescriptionInput,
);

declare global {
  interface HTMLElementTagNameMap {
    "twisty-puzzle-description-input": TwistyPuzzleDescriptionInput;
  }
}
