import { offsetMod } from "../../../../cubing/alg/cubing-private";
import { KState, type KPuzzle } from "../../../../cubing/kpuzzle";
import { puzzles, type PuzzleLoader } from "../../../../cubing/puzzles";
import { TwistyAnimatedSVG } from "../../../../cubing/twisty/views/2D/TwistyAnimatedSVG";
import { defToString, stateToString } from "../3x3x3-formats/convert";

interface PieceFacelets {
  [orientation: number]: Facelet;
}

type Mode = "swap" | "twist" | "ignore_orientation";

function flash(elem: Element) {
  elem.animate([{ opacity: 0.25 }, { opacity: 1 }], {
    duration: 250,
    easing: "ease-out",
  });
}

// TODO: make this easier to reuse.
function downloadJSONFile(jsonString: string, fileName: string) {
  const a = document.createElement("a");
  a.download = fileName;
  const blob = new Blob([jsonString], { type: "text/json" });
  a.href = URL.createObjectURL(blob);
  a.click();
}

class App {
  mode: Mode = "swap";
  puzzle: Promise<PuzzleStateEditor>;
  copyStateElem: HTMLTextAreaElement = document.querySelector("#copy-state")!;
  downloadDefElem: HTMLTextAreaElement =
    document.querySelector("#download-def")!;
  downloadStateElem: HTMLTextAreaElement =
    document.querySelector("#download-state")!;
  stateElem: HTMLTextAreaElement = document.querySelector(
    "#display-state-text",
  )!;

  constructor() {
    const puzzleSelect = document.querySelector(
      "#puzzles",
    ) as HTMLSelectElement;

    for (const puzzle in puzzles) {
      const option: HTMLOptionElement = puzzleSelect.appendChild(
        document.createElement("option"),
      )!;
      option.value = puzzle;
      option.textContent = puzzles[puzzle].fullName;
    }

    const puzzle = new URL(location.href).searchParams.get("puzzle") || "3x3x3";
    if (puzzle) {
      if (puzzle in puzzles) {
        this.puzzle = PuzzleStateEditor.createAsync(puzzles[puzzle], () =>
          this.displayStateText(),
        );
        puzzleSelect.value = puzzle;
      } else {
        console.error("Invalid puzzle:", puzzle);
      }
    }

    puzzleSelect?.addEventListener("change", () => {
      (async () => {
        (await this.puzzle).setPuzzle(puzzles[puzzleSelect.value]);
      })();

      const url = new URL(location.href);
      url.searchParams.set("puzzle", puzzleSelect.value);
      window.history.replaceState("", "", url.toString());
    });

    document
      .querySelectorAll('input[name="mode"]')
      .forEach((radio: HTMLInputElement) => {
        radio.addEventListener("change", () => {
          this.mode = radio.value as Mode;
        });
      });

    this.copyStateElem.addEventListener("click", async () => {
      navigator.clipboard.writeText(stateToString((await this.puzzle).state));
    });

    this.downloadDefElem.addEventListener("click", async () => {
      const def = (await this.puzzle).kpuzzle.definition;
      downloadJSONFile(defToString(def), `${def.name}.kpuzzle.json`);
    });

    this.downloadStateElem.addEventListener("click", async () => {
      const puzzle = await this.puzzle;
      const { kpuzzle, state } = puzzle;
      downloadJSONFile(
        stateToString(state),
        `${kpuzzle.definition.name}.scramble.json`,
      );
    });
  }

  async displayStateText() {
    this.stateElem.value = stateToString((await this.puzzle).state);
  }
}

class PuzzleStateEditor {
  selectedFacelet: Facelet | null;
  pieces = new Map<string, { [position: number]: PieceFacelets }>();

  svgAnimator: TwistyAnimatedSVG;
  svgString: string;
  kpuzzle: KPuzzle;
  state: KState;

  private constructor(private displayStateText: () => void) {
    this.displayStateText();
  }

  static async createAsync(
    puzzle: PuzzleLoader,
    displayStateText: () => void,
  ): Promise<PuzzleStateEditor> {
    const [svgString, kpuzzle] = await Promise.all([
      puzzle.svg(),
      puzzle.kpuzzle(),
    ]);
    const instance = new PuzzleStateEditor(displayStateText);
    instance.setPuzzleSync(svgString, kpuzzle);
    return instance;
  }

  private displayState() {
    this.svgAnimator.drawState(this.state);
    this.displayStateText();
  }

  private async setPuzzleSync(svgString: string, kpuzzle: KPuzzle) {
    this.kpuzzle = kpuzzle;
    this.state = new KState(
      kpuzzle,
      structuredClone(kpuzzle.startState().stateData),
    );

    const wrapper = document.querySelector("#puzzle")!;
    wrapper.innerHTML = "";
    this.svgAnimator = new TwistyAnimatedSVG(
      kpuzzle,
      svgString,
      undefined,
      true,
    );
    wrapper.appendChild(this.svgAnimator.wrapperElement);
    document.querySelector("svg")!.removeAttribute("width");
    document.querySelector("svg")!.removeAttribute("height");

    this.display();

    this.selectedFacelet = null;
  }

  async setPuzzle(puzzle: PuzzleLoader) {
    const [svg, kpuzzle] = await Promise.all([puzzle.svg(), puzzle.kpuzzle()]);
    this.setPuzzleSync(svg, kpuzzle);
    this.displayState();
  }

  display() {
    const { orbits } = this.kpuzzle.definition;

    for (const orbitName in orbits) {
      const orbitVal = orbits[orbitName];

      for (
        let orientation = 0;
        orientation < orbitVal.numOrientations;
        orientation++
      ) {
        for (let piece = 0; piece < orbitVal.numPieces; piece++) {
          const facelet = new Facelet(orbitName, piece, orientation);
          if (!this.pieces.get(orbitName)) {
            this.pieces.set(orbitName, {});
          }
          this.pieces.get(orbitName)![piece] = {
            ...this.pieces.get(orbitName)![piece],
            [orientation]: facelet,
          };
        }
      }
    }
  }

  getFaceletByOrientation(piece: PieceFacelets, orientation: number) {
    return piece[orientation];
  }

  getPieceByFacelet({ pieceIndex: position, orbit: type }: Facelet) {
    return this.pieces.get(type)![position];
  }

  async twist(facelet: Facelet) {
    const { orbits } = this.kpuzzle.definition;
    const { numOrientations } = orbits[facelet.orbit];

    const stateOrbit = this.state.stateData[facelet.orbit];
    stateOrbit.orientation[facelet.pieceIndex] = offsetMod(
      stateOrbit.orientation[facelet.pieceIndex] + 1,
      numOrientations,
    );
    this.displayState();
    flash(facelet.element);
  }

  async swap(facelet1: Facelet, facelet2: Facelet) {
    const piece1 = this.getPieceByFacelet(facelet1);
    const piece2 = this.getPieceByFacelet(facelet2);

    if (piece1 === piece2) {
      return;
    }

    const offset = facelet2.orientationIndex - facelet1.orientationIndex;
    const { orbits } = this.kpuzzle.definition;
    const { numOrientations } = orbits[facelet1.orbit];

    const stateOrbit = this.state.stateData[facelet1.orbit];
    const piece1Index = stateOrbit.pieces[facelet1.pieceIndex];
    const piece1Orientation = stateOrbit.orientation[facelet1.pieceIndex];
    const piece2Index = stateOrbit.pieces[facelet2.pieceIndex];
    const piece2Orientation = stateOrbit.orientation[facelet2.pieceIndex];

    stateOrbit.pieces[facelet1.pieceIndex] = piece2Index;
    stateOrbit.orientation[facelet1.pieceIndex] = offsetMod(
      piece2Orientation - offset,
      numOrientations,
    );

    stateOrbit.pieces[facelet2.pieceIndex] = piece1Index;
    stateOrbit.orientation[facelet2.pieceIndex] = offsetMod(
      piece1Orientation + offset,
      numOrientations,
    );
    this.displayState();
    flash(facelet1.element);
    flash(facelet2.element);
  }

  async ignoreOrientation(facelet: Facelet) {
    const { orbits } = this.kpuzzle.definition;
    const { numPieces } = orbits[facelet.orbit];

    const stateOrbit = this.state.stateData[facelet.orbit];
    stateOrbit.orientationMod ??= new Array(numPieces).fill(0);
    stateOrbit.orientationMod[facelet.pieceIndex] =
      1 - stateOrbit.orientationMod[facelet.pieceIndex];
    this.displayState();
    flash(facelet.element);
  }
}

class Facelet {
  orbit: string;
  pieceIndex: number;
  orientationIndex: number;
  element: HTMLOrSVGImageElement;

  constructor(type: string, position: number, orientation: number) {
    this.orbit = type;
    this.orientationIndex = orientation;
    this.pieceIndex = position;
    this.element = document.getElementById(
      this.getId(),
    )! as HTMLOrSVGImageElement;
    this.element.addEventListener("pointerdown", (e: PointerEvent) => {
      this.click(e);
    });
  }

  getId() {
    return `${this.orbit}-l${this.pieceIndex}-o${this.orientationIndex}`;
  }

  async deselect() {
    (await app.puzzle).selectedFacelet = null;
    this.element.style.opacity = "1";
  }

  async select() {
    const puzzle = await app.puzzle;
    if (puzzle.selectedFacelet) {
      puzzle.selectedFacelet.deselect();
    }

    puzzle.selectedFacelet = this;
    this.element.style.opacity = "0.7";
  }

  async click(e: PointerEvent) {
    const puzzle = await app.puzzle;
    switch (app.mode) {
      case "swap": {
        if (
          puzzle.selectedFacelet &&
          puzzle.selectedFacelet.orbit === this.orbit
        ) {
          puzzle.swap(puzzle.selectedFacelet, this);
          puzzle.selectedFacelet.deselect();
        } else {
          puzzle.selectedFacelet?.deselect();
          this.select();
        }
        e.preventDefault();
        break;
      }
      case "twist": {
        puzzle.twist(this);
        e.preventDefault();
        break;
      }
      case "ignore_orientation": {
        puzzle.ignoreOrientation(this);
        e.preventDefault();
        break;
      }
      default:
        console.error("unexpected mode", app.mode);
        break;
    }
  }
}

const app = new App();
(window as any).app = app;
