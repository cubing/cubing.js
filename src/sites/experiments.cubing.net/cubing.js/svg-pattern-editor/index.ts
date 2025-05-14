import { offsetMod } from "../../../../cubing/alg/cubing-private";
import { KPattern, type KPuzzle } from "../../../../cubing/kpuzzle";
import { type PuzzleLoader, puzzles } from "../../../../cubing/puzzles";
import { TwistyAnimatedSVG } from "../../../../cubing/twisty/views/2D/TwistyAnimatedSVG";
import { defToString, patternToString } from "../3x3x3-formats/convert";

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
  puzzle: Promise<PuzzlePatternEditor>;
  copyPatternElem: HTMLTextAreaElement =
    document.querySelector("#copy-pattern")!;
  downloadDefElem: HTMLTextAreaElement =
    document.querySelector("#download-def")!;
  downloadPatternElem: HTMLTextAreaElement =
    document.querySelector("#download-pattern")!;
  patternElem: HTMLTextAreaElement = document.querySelector(
    "#display-pattern-text",
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
    if (puzzle in puzzles) {
      this.puzzle = PuzzlePatternEditor.createAsync(puzzles[puzzle], () =>
        this.displayPatternText(),
      );
      puzzleSelect.value = puzzle;
    } else {
      console.error("Invalid puzzle:", puzzle);
      throw new Error("Invalid puzzle.");
    }

    puzzleSelect?.addEventListener("change", () => {
      (async () => {
        (await this.puzzle).setPuzzle(puzzles[puzzleSelect.value]);
      })();

      const url = new URL(location.href);
      url.searchParams.set("puzzle", puzzleSelect.value);
      window.history.replaceState("", "", url.toString());
    });

    for (const radio of document.querySelectorAll<HTMLInputElement>(
      'input[name="mode"]',
    )) {
      radio.addEventListener("change", () => {
        this.mode = radio.value as Mode;
      });
    }

    this.copyPatternElem.addEventListener("click", async () => {
      navigator.clipboard.writeText(
        patternToString((await this.puzzle).pattern),
      );
    });

    this.downloadDefElem.addEventListener("click", async () => {
      const def = (await this.puzzle).kpuzzle.definition;
      downloadJSONFile(defToString(def), `${def.name}.kpuzzle.json`);
    });

    this.downloadPatternElem.addEventListener("click", async () => {
      const puzzle = await this.puzzle;
      const { kpuzzle, pattern } = puzzle;
      downloadJSONFile(
        patternToString(pattern),
        `${kpuzzle.definition.name}.scramble.json`,
      );
    });
  }

  async displayPatternText() {
    this.patternElem.value = patternToString((await this.puzzle).pattern);
  }
}

class PuzzlePatternEditor {
  selectedFacelet?: Facelet;
  pieces = new Map<string, { [position: number]: PieceFacelets }>();

  svgAnimator!: TwistyAnimatedSVG; // TODO: Refactor to avoid non-null assertion.
  svgString!: string; // TODO: Refactor to avoid non-null assertion.
  kpuzzle!: KPuzzle; // TODO: Refactor to avoid non-null assertion.
  pattern!: KPattern; // TODO: Refactor to avoid non-null assertion.

  private constructor(private displayPatternText: () => void) {
    this.displayPatternText();
  }

  static async createAsync(
    puzzle: PuzzleLoader,
    displayPatternText: () => void,
  ): Promise<PuzzlePatternEditor> {
    const [svgString, kpuzzle] = await Promise.all([
      puzzle.svg(),
      puzzle.kpuzzle(),
    ]);
    const instance = new PuzzlePatternEditor(displayPatternText);
    instance.setPuzzleSync(svgString, kpuzzle);
    return instance;
  }

  private displayPattern() {
    this.svgAnimator.drawPattern(this.pattern);
    this.displayPatternText();
  }

  private async setPuzzleSync(svgString: string, kpuzzle: KPuzzle) {
    this.kpuzzle = kpuzzle;
    this.pattern = new KPattern(
      kpuzzle,
      structuredClone(kpuzzle.defaultPattern().patternData),
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

    this.selectedFacelet = undefined;
  }

  async setPuzzle(puzzle: PuzzleLoader) {
    const [svg, kpuzzle] = await Promise.all([puzzle.svg(), puzzle.kpuzzle()]);
    this.setPuzzleSync(svg, kpuzzle);
    this.displayPattern();
  }

  display() {
    for (const orbitDefinition of this.kpuzzle.definition.orbits) {
      for (
        let orientation = 0;
        orientation < orbitDefinition.numOrientations;
        orientation++
      ) {
        for (let piece = 0; piece < orbitDefinition.numPieces; piece++) {
          const facelet = new Facelet(
            orbitDefinition.orbitName,
            piece,
            orientation,
          );
          if (!this.pieces.get(orbitDefinition.orbitName)) {
            this.pieces.set(orbitDefinition.orbitName, {});
          }
          this.pieces.get(orbitDefinition.orbitName)![piece] = {
            ...this.pieces.get(orbitDefinition.orbitName)![piece],
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
    const { numOrientations } = this.kpuzzle.lookupOrbitDefinition(
      facelet.orbit,
    );

    const patternOrbit = this.pattern.patternData[facelet.orbit];
    patternOrbit.orientation[facelet.pieceIndex] = offsetMod(
      patternOrbit.orientation[facelet.pieceIndex] + 1,
      numOrientations,
    );
    this.displayPattern();
    flash(facelet.element);
  }

  async swap(facelet1: Facelet, facelet2: Facelet) {
    const piece1 = this.getPieceByFacelet(facelet1);
    const piece2 = this.getPieceByFacelet(facelet2);

    if (piece1 === piece2) {
      return;
    }

    const offset = facelet2.orientationIndex - facelet1.orientationIndex;
    const { numOrientations } = this.kpuzzle.lookupOrbitDefinition(
      facelet1.orbit,
    );

    const patternOrbit = this.pattern.patternData[facelet1.orbit];
    const piece1Index = patternOrbit.pieces[facelet1.pieceIndex];
    const piece1Orientation = patternOrbit.orientation[facelet1.pieceIndex];
    const piece2Index = patternOrbit.pieces[facelet2.pieceIndex];
    const piece2Orientation = patternOrbit.orientation[facelet2.pieceIndex];

    patternOrbit.pieces[facelet1.pieceIndex] = piece2Index;
    patternOrbit.orientation[facelet1.pieceIndex] = offsetMod(
      piece2Orientation - offset,
      numOrientations,
    );

    patternOrbit.pieces[facelet2.pieceIndex] = piece1Index;
    patternOrbit.orientation[facelet2.pieceIndex] = offsetMod(
      piece1Orientation + offset,
      numOrientations,
    );
    this.displayPattern();
    flash(facelet1.element);
    flash(facelet2.element);
  }

  async ignoreOrientation(facelet: Facelet) {
    const { numPieces } = this.kpuzzle.lookupOrbitDefinition(facelet.orbit);

    const patternOrbit = this.pattern.patternData[facelet.orbit];
    patternOrbit.orientationMod ??= new Array(numPieces).fill(0);
    patternOrbit.orientationMod[facelet.pieceIndex] =
      1 - patternOrbit.orientationMod[facelet.pieceIndex];
    this.displayPattern();
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
    this.element.addEventListener(
      "pointerdown",
      ((e: PointerEvent) => {
        this.click(e);
      }) as any as EventListener, // TODO: https://github.com/microsoft/TypeScript/issues/28357
    );
  }

  getId() {
    return `${this.orbit}-l${this.pieceIndex}-o${this.orientationIndex}`;
  }

  async deselect() {
    (await app.puzzle).selectedFacelet = undefined;
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
