import {
  EXPERIMENTAL_PUZZLE_CUT_TYPES,
  type ExperimentalPuzzleBaseShape,
  type ExperimentalPuzzleCutDescription,
  type ExperimentalPuzzleCutType,
  type ExperimentalPuzzleDescription,
} from "../../../cubing/puzzle-geometry";
import type {
  PuzzleBaseShape,
  PuzzleCutType,
} from "../../../cubing/puzzle-geometry/PuzzleGeometry";

const sqrt = Math.sqrt.bind(Math);

const SnapEpsilon = 0.01;

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
        descriptionStringParts.push(
          this.clean(this.puzzleShape, cutType, +input.value).toString(),
        );
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

  clean(base: PuzzleBaseShape, cut: PuzzleCutType, ival: number): number {
    const goodpts = KeyPoints[base + cut];
    let best = 1000;
    for (const v of goodpts) {
      if (
        Math.abs(v - ival) < SnapEpsilon &&
        Math.abs(v - ival) < Math.abs(best - ival)
      ) {
        best = v;
      }
    }
    if (best !== 1000) {
      return best;
    }
    return ival;
  }

  inputMax(cutType: ExperimentalPuzzleCutType): number {
    return (
      Math.ceil(MAX_DISTANCE_TABLE[this.puzzleShape][cutType] * 1000 - 1) / 1000
    );
  }

  addInput(cut: ExperimentalPuzzleCutDescription): HTMLInputElement {
    const section = this.sectionElems[cut.cutType];
    const inputsGoBeforeHere = section.querySelector(".inputs-go-before-here");

    const input = document.createElement("input");
    section.insertBefore(input, inputsGoBeforeHere);
    input.type = "range";
    input.min = "0";
    input.max = this.inputMax(cut.cutType).toString(); // TODO: adjust based on puzzle and cut type
    input.step = "0.001";
    input.value = cut.distance.toString();
    input.addEventListener("input", () => {
      this.dispatchPuzzleDescription();
    });

    const removeButton = document.createElement("button");
    section.insertBefore(removeButton, inputsGoBeforeHere);
    removeButton.textContent = "❌";
    removeButton.title = "Remove this cut";
    removeButton.addEventListener("click", () => {
      input.remove();
      removeButton.remove();
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
    for (const extraInputs of Object.values(existingInputs)) {
      for (const extraInput of extraInputs) {
        extraInput.nextElementSibling!.remove();
        extraInput.remove();
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

const KeyPoints: Record<string, number[]> = {
  te: [0, 0.346184634065199, 0.577350269189626, 0.866025403784437],
  if: [
    0, 0.0437137412199553, 0.10557280900008, 0.142911758634148, 0.2360679774998,
    0.272067557625603, 0.333333333333342, 0.381966011250105, 0.366293370955617,
    0.461896476441222, 0.527864045000399, 0.555741433418137, 0.56691527068179,
    0.579145823610522, 0.618033988749886, 0.672742662378172, 0.745355992499953,
    0.770969598759586,
  ],
  df: [
    0, 0.105585091198902, 0.236067977499772, 0.358548932642016,
    0.447213595499989, 0.548137753621931, 0.618033988749895, 0.745604667392652,
  ],
  ie: [
    0, 0.118724773661763, 0.136293910356528, 0.157981582327811,
    0.171657248314431, 0.185354472327642, 0.22052817941659, 0.225206963771198,
    0.231801297246193, 0.255235116516706, 0.267616567329866, 0.279397861264267,
    0.295869600077765, 0.302680679737852, 0.308301945313531, 0.311882116063692,
    0.316521888676107, 0.324005476841408, 0.330792269124856, 0.346272894885839,
    0.356822089773061, 0.36998951851398, 0.408881731069641, 0.427045750483211,
    0.449404510502461, 0.472055041464925, 0.47872706916371, 0.485249039797452,
    0.498843026314944, 0.515190145191102, 0.535233134659677, 0.548806039292405,
    0.577350269189651, 0.618315762969106, 0.661584538249713, 0.692375929817155,
    0.774596669241419, 0.7945579326996, 0.807144971628418, 0.826580114438045,
    0.86602540378442, 0.888053374878366, 0.934172358962655, 0.944421022283983,
  ],
  iv: [
    0, 0.112482206141184, 0.187592474085081, 0.28138871112762,
    0.562777422255239, 0.736685209782635, 0.794654472291766, 0.841075170785081,
    0.910592997310029,
  ],
  tv: [0, 0.333333333333333, 0.600260416666341, 0.999999999500001],
  oe: [
    0, 0.244789502290502, 0.408248290463866, 0.461990350408647,
    0.489897948556645, 0.524941918234976, 0.61237243569579, 0.689716350284335,
    0.816496580927733, 0.852377778460046,
  ],
  of: [0, 0.199869791666992, 0.333333333333, 0.500000000000001],
  dv: [
    0, 0.0560874285802, 0.0990233221822336, 0.129641954773404,
    0.187592474085079, 0.259374724922907, 0.41946952412161, 0.502579833588376,
    0.531745191119057, 0.562791600335274, 0.592300472889519, 0.617533116288632,
    0.678715947273417, 0.726155636708975, 0.794654472291768, 0.854832593500508,
    0.937962370400783, 1.09818547139511,
  ],
  de: [
    0, 0.128563971004914, 0.145308505600951, 0.170241453552642,
    0.200811415886164, 0.20942149071417, 0.214828453505561, 0.224204126002919,
    0.242180842668631, 0.254805789761306, 0.262865556059523, 0.27330868728898,
    0.277514551425611, 0.284605286554775, 0.305018008054503, 0.313608385297821,
    0.324919696232883, 0.345069250323634, 0.363271264002833, 0.37817914684952,
    0.411888053250777, 0.411888053926078, 0.41188805460115, 0.429660084874436,
    0.449027976579373, 0.476892790186451, 0.525731112119047, 0.544456729884171,
    0.547822164005765, 0.551644835984693, 0.562428193028154, 0.575156248114469,
    0.587785252292405, 0.606349458290752, 0.634037677529931, 0.64731718197753,
    0.726542528005439, 0.777241350811778, 0.79854751226776, 0.817679191298903,
    0.85065080835193, 0.886439952295727, 0.951056516295154, 1.02604067771384,
  ],
  tf: [0],
  cv: [
    0, 0.192450089729875, 0.239059095459766, 0.577350269189594,
    0.915641442663986, 0.962250448649376, 1.15470053837926, 1.34715062810913,
  ],
  ce: [
    0, 0.2357022604, 0.261021839065223, 0.353553390593277, 0.414205290678296,
    0.471404520791054, 0.546902900980241, 0.707106781186553, 0.943269392613834,
  ],
  cf: [0, 0.333333333333333],
  ov: [
    0, 0.433012701892219, 0.577350269189626, 0.692933086751677, 0.8660254038,
  ],
};
