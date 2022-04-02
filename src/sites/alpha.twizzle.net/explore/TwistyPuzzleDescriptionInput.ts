import {
  ExperimentalPuzzleBaseShape,
  ExperimentalPuzzleCutDescription,
  ExperimentalPuzzleCutType,
  ExperimentalPuzzleDescription,
  EXPERIMENTAL_PUZZLE_CUT_TYPES,
} from "../../../cubing/puzzle-geometry";

const sqrt = Math.sqrt.bind(Math);

// Each value needs at least 4 digits of precision.
const MAX_DISTANCE_TABLE: Record<
  ExperimentalPuzzleBaseShape,
  Record<ExperimentalPuzzleCutType, number>
> = {
  c: {
    f: 1,
    v: sqrt(3),
    e: sqrt(2),
  },
  t: {
    f: 1,
    v: 3,
    e: sqrt(3),
  },
  o: {
    f: 1,
    v: sqrt(3),
    e: sqrt(3 / 2),
  },
  d: {
    f: 1,
    v: 1.2584,
    e: 1.1756,
  },
  i: {
    f: 1,
    v: 1.2584,
    e: 1.0705,
  },
};

export class TwistyPuzzleDescriptionInput extends HTMLElement {
  puzzleShapeSelect: HTMLInputElement = this.querySelector("#puzzle-shape")!;
  sectionElems: Record<ExperimentalPuzzleCutType, HTMLElement> = {
    f: this.querySelector("#f-cuts")!,
    v: this.querySelector("#v-cuts")!,
    e: this.querySelector("#e-cuts")!,
  };
  connectedCallback() {
    for (const [cutType, section] of Object.entries(this.sectionElems)) {
      section.querySelector("button")?.addEventListener("click", () => {
        this.addInput({
          cutType: cutType as ExperimentalPuzzleCutType,
          distance: 0,
        });
        this.dispatchPuzzleDescription();
      });
    }

    this.puzzleShapeSelect.addEventListener("change", () => {
      this.dispatchPuzzleDescription();
    });
  }

  get puzzleShape(): ExperimentalPuzzleBaseShape {
    const shape = this.puzzleShapeSelect.value as ExperimentalPuzzleBaseShape;
    return shape;
  }

  dispatchPuzzleDescription() {
    const descriptionStringParts: string[] = [this.puzzleShape];
    for (const cutType of EXPERIMENTAL_PUZZLE_CUT_TYPES) {
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

  inputMax(cutType: ExperimentalPuzzleCutType): number {
    return (
      Math.ceil(MAX_DISTANCE_TABLE[this.puzzleShape][cutType] * 1000 - 1) / 1000
    );
  }

  addInput(cut: ExperimentalPuzzleCutDescription): HTMLInputElement {
    const section = this.sectionElems[cut.cutType];

    const removeButton = document.createElement("button");
    section.prepend(removeButton);
    removeButton.textContent = "❌";
    removeButton.title = "Remove this cut";
    removeButton.addEventListener("click", () => {
      input.remove();
      removeButton.remove();
      this.dispatchPuzzleDescription();
    });

    const input = document.createElement("input");
    section.prepend(input);
    input.type = "range";
    input.min = "0";
    input.max = this.inputMax(cut.cutType).toString(); // TODO: adjust based on puzzle and cut type
    input.step = "0.001";
    input.value = cut.distance.toString();
    input.addEventListener("input", () => {
      this.dispatchPuzzleDescription();
    });
    return input;
  }

  set puzzleDescription(puzzleDescription: ExperimentalPuzzleDescription) {
    const existingInputs: Record<
      ExperimentalPuzzleCutType,
      HTMLInputElement[]
    > = {
      f: Array.from(this.sectionElems["f"].querySelectorAll("input")),
      v: Array.from(this.sectionElems["v"].querySelectorAll("input")),
      e: Array.from(this.sectionElems["e"].querySelectorAll("input")),
    };

    this.puzzleShapeSelect.value = puzzleDescription.shape;

    for (const cut of puzzleDescription.cuts) {
      const existingInput: HTMLInputElement | undefined = existingInputs[
        cut.cutType
      ].splice(0, 1)[0];
      if (existingInput) {
        existingInput.value = cut.distance.toString();
        existingInput.max = this.inputMax(cut.cutType).toString();
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
