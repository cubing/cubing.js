import { puzzles, PuzzleLoader } from "../../../../cubing/puzzles";

interface Piece {
  [orientation: number]: Facelet;
}

type Mode = "swap" | "twist";

class App {
  mode: Mode = "swap";
  cube: Cube;

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
        this.cube = new Cube(puzzles[puzzle]);
        puzzleSelect.value = puzzle;
      } else {
        console.error("Invalid puzzle:", puzzle);
      }
    }

    puzzleSelect?.addEventListener("change", () => {
      this.cube.setPuzzle(puzzles[puzzleSelect.value]);

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
  }
}

class Cube {
  selectedFacelet: Facelet | null;
  pieces = new Map<string, { [position: number]: Piece }>();

  puzzle: PuzzleLoader;

  constructor(puzzle: PuzzleLoader) {
    this.setPuzzle(puzzle);
  }

  setPuzzle(puzzle: PuzzleLoader) {
    this.puzzle = puzzle;

    puzzle.svg().then((svg) => {
      document.querySelector("#puzzle")!.innerHTML = svg;
      document.querySelector("svg")!.removeAttribute("width");
      document.querySelector("svg")!.removeAttribute("height");

      this.displayCube();
    });
    this.selectedFacelet = null;
  }

  displayCube = async () => {
    const { orbits } = (await this.puzzle.kpuzzle()).definition;

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
  };

  getFaceletByOrientation(piece: Piece, orientation: number) {
    return piece[orientation];
  }

  getPieceByFacelet({ position, type }: Facelet) {
    return this.pieces.get(type)![position];
  }

  swapFacelets(facelet1: Facelet, facelet2: Facelet) {
    const temp = facelet1.element.style.fill;
    facelet1.element.style.fill = facelet2.element.style.fill;
    facelet2.element.style.fill = temp;
  }

  async twist(facelet: Facelet) {
    const piece = this.getPieceByFacelet(facelet);

    const { orbits } = (await this.puzzle.kpuzzle()).definition;

    const { numOrientations } = orbits[facelet.type];

    for (let i = 0; i < numOrientations - 1; i++) {
      const facelet = this.getFaceletByOrientation(piece, i);
      const facelet2Orientation =
        (numOrientations + facelet.orientation + 1) % numOrientations;
      this.swapFacelets(
        facelet,
        this.getFaceletByOrientation(piece, facelet2Orientation),
      );
    }
  }

  async swap(facelet1: Facelet, facelet2: Facelet) {
    const piece1 = this.getPieceByFacelet(facelet1);
    const piece2 = this.getPieceByFacelet(facelet2);

    if (piece1 === piece2) {
      return;
    }

    const offset = facelet2.orientation - facelet1.orientation;

    const { orbits } = (await this.puzzle.kpuzzle()).definition;

    const { numOrientations } = orbits[facelet1.type];

    for (let i = 0; i < numOrientations; i++) {
      const facelet = this.getFaceletByOrientation(piece1, i);

      const facelet2Orientation =
        (numOrientations + facelet.orientation + offset) % numOrientations;
      this.swapFacelets(
        facelet,
        this.getFaceletByOrientation(piece2, facelet2Orientation),
      );
    }
  }
}

class Facelet {
  type: string;
  position: number;
  orientation: number;
  element: HTMLOrSVGImageElement;

  constructor(type: string, position: number, orientation: number) {
    this.type = type;
    this.orientation = orientation;
    this.position = position;
    this.element = document.getElementById(
      this.getId(),
    )! as HTMLOrSVGImageElement;
    this.element.onclick = () => this.click();
  }

  getId() {
    return `${this.type}-l${this.position}-o${this.orientation}`;
  }

  deselect() {
    app.cube.selectedFacelet = null;
    this.element.style.opacity = "1";
  }

  select() {
    if (app.cube.selectedFacelet) {
      app.cube.selectedFacelet.deselect();
    }

    app.cube.selectedFacelet = this;
    this.element.style.opacity = "0.7";
  }

  click() {
    switch (app.mode) {
      case "swap": {
        if (
          app.cube.selectedFacelet &&
          app.cube.selectedFacelet.type === this.type
        ) {
          app.cube.swap(app.cube.selectedFacelet, this);

          app.cube.selectedFacelet.deselect();
        } else {
          this.select();
        }
        break;
      }
      case "twist": {
        app.cube.twist(this);
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
