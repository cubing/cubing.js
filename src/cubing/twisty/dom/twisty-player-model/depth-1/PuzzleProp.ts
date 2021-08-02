import { PuzzleLoader, puzzles } from "../../../../puzzles";
import type { PuzzleID } from "../../TwistyPlayerConfig";

export class PuzzleProp extends EventTarget {
  #puzzleID: PuzzleID = "3x3x3";

  constructor() {
    super();
  }

  set puzzleID(newPuzzleID: PuzzleID) {
    // TODO: is this the right way?
    if (this.#puzzleID !== newPuzzleID) {
      this.#puzzleID = newPuzzleID;
      this.dispatchEvent(new CustomEvent("update"));
    }
  }

  get puzzleID(): PuzzleID {
    return this.#puzzleID;
  }

  get puzzleLoader(): PuzzleLoader {
    return puzzles[this.#puzzleID];
  }
}
