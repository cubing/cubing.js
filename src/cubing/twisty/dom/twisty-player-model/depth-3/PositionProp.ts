import type { PuzzlePosition } from "../../../animation/cursor/CursorTypes";
import type { PuzzleProp } from "../depth-1/PuzzleProp";
import type { PuzzleAlgProp } from "../depth-2/PuzzleAlgProp";
import { ManagedSource } from "../ManagedSource";

export class PositionProp extends EventTarget {
  #puzzleAlgProp: ManagedSource<PuzzleAlgProp>;
  #puzzleSetupProp: ManagedSource<PuzzleAlgProp>;
  #puzzleProp: ManagedSource<PuzzleProp>;

  constructor(
    puzzleAlgProp: PuzzleAlgProp,
    puzzleSetupProp: PuzzleAlgProp,
    puzzleProp: PuzzleProp,
  ) {
    super();
    this.#puzzleAlgProp = new ManagedSource(
      puzzleAlgProp,
      this.onAlg.bind(this),
    );
    this.#puzzleSetupProp = new ManagedSource(
      puzzleSetupProp,
      this.onSetup.bind(this),
    );
    this.#puzzleProp = new ManagedSource(puzzleProp, this.onPuzzle.bind(this));
  }

  async onAlg(): Promise<void> {
    console.log("PlayerPositionProp.onDerivedAlg");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    console.log(` | alg = ${await this.#puzzleAlgProp.target.alg()}`);
  }

  async onSetup(): Promise<void> {
    console.log("PlayerPositionProp.onDerivedAlg");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    console.log(` | setup = ${await this.#puzzleSetupProp.target.alg()}`);
  }

  onPuzzle(): void {
    console.log("PlayerPositionProp.onPuzzle");
    // TODO: dedup
    // TODO: Push into `this.element
    // this.wrapperElement.appendChild(document.createElement("br"));
    console.log(` | puzzle = ${this.#puzzleProp.target.puzzleID}`);
  }

  async position(): Promise<PuzzlePosition> {
    throw new Error("Unipmlemented!");
  }
}
