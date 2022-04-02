// TODO: deduplicate this with `PuzzleGeometry`.
const CUT_TYPES = ["f", "v", "e"] as const;
type CutTypeString = typeof CUT_TYPES[number];

import type { PuzzleDescription } from "../../../cubing/puzzle-geometry/PuzzleGeometry";

export class TwistyPuzzleDescriptionInput extends HTMLElement {
  sectionElems: Record<CutTypeString, HTMLElement> = {
    f: this.querySelector("#f-cuts")!,
    v: this.querySelector("#v-cuts")!,
    e: this.querySelector("#e-cuts")!,
  };
  connectedCallback() {
    for (const [cutType, section] of Object.entries(this.sectionElems)) {
      section.querySelector("button")?.addEventListener("click", () => {
        this.addInput({
          cutType: cutType as CutTypeString,
          distance: 0,
        });
        this.dispatchPuzzleDescription();
      });
    }
  }

  dispatchPuzzleDescription() {
    const descriptionStringParts = [`c`];
    for (const cutType of CUT_TYPES) {
      for (const input of Array.from(
        this.sectionElems[cutType].querySelectorAll("input")!,
      )) {
        descriptionStringParts.push(cutType);
        descriptionStringParts.push(input.value);
      }
    }

    const descriptionString = descriptionStringParts.join(" ");

    this.dispatchEvent(
      new CustomEvent("puzzle-change", {
        detail: {
          descriptionString,
        },
      }),
    );
  }

  addInput(cut: PuzzleDescription["cuts"][number]): HTMLInputElement {
    const input = document.createElement("input");
    this.sectionElems[cut.cutType].prepend(input);
    input.type = "range";
    input.min = "0";
    input.max = "2"; // TODO: adjust based on puzzle and cut type
    input.step = "0.001";
    input.value = cut.distance.toString();
    input.addEventListener("input", () => {
      this.dispatchPuzzleDescription();
    });
    return input;
  }

  set puzzleDescription(puzzleDescription: PuzzleDescription) {
    const existingInputs: Record<CutTypeString, HTMLInputElement[]> = {
      f: Array.from(this.sectionElems["f"].querySelectorAll("input")),
      v: Array.from(this.sectionElems["v"].querySelectorAll("input")),
      e: Array.from(this.sectionElems["e"].querySelectorAll("input")),
    };

    for (const cut of puzzleDescription.cuts) {
      const existingInput: HTMLInputElement | undefined = existingInputs[
        cut.cutType
      ].splice(0, 1)[0];
      if (existingInput) {
        existingInput.value = cut.distance.toString();
      } else {
        this.addInput(cut);
      }
    }
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
