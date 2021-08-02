import { PuzzleLoader, puzzles } from "../../..//puzzles";

import { Alg } from "../../../alg";
import { KPuzzle } from "../../../kpuzzle";
import type { PuzzleID } from "../TwistyPlayerConfig";

// TODO: add stale marker?
class ManagedSource<T extends EventTarget> extends EventTarget {
  #target: T; // TODO: | null
  constructor(target: T, private listener: () => {}) {
    super();
    this.set(target);
  }

  get target(): T {
    return this.#target;
  }

  clear(): void {
    this.#target?.removeEventListener("update", this.listener);
  }

  set(target: T): void {
    this.clear();
    this.#target?.addEventListener("update", this.listener);
    this.#target = target;
  }
}

class AlgProp extends EventTarget {
  #alg: Alg = new Alg();

  set alg(newAlg: Alg) {
    // TODO: is this the right way?
    if (!this.#alg.isIdentical(newAlg)) {
      this.#alg = newAlg;
      this.dispatchEvent(new CustomEvent("update"));
    }
  }

  get alg(): Alg {
    return this.#alg;
  }
}

class PuzzleProp extends EventTarget {
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

class AlgIssues {
  warnings: string[] = [];
  errors: string[] = [];
}

class DisplayAlgProp extends EventTarget {
  algSource: ManagedSource<AlgProp>;
  #algIssues: Promise<AlgIssues> | null = null;
  puzzleSource: ManagedSource<PuzzleProp>;

  constructor(algProp: AlgProp, puzzleProp: PuzzleProp) {
    super();
    this.algSource = new ManagedSource<AlgProp>(algProp, this.onAlg.bind(this));
    this.puzzleSource = new ManagedSource<PuzzleProp>(
      puzzleProp,
      this.onPuzzle.bind(this),
    );
  }

  onAlg() {
    console.log("onAlg", "onPuzzle");
    this.#algIssues = null;
  }

  onPuzzle() {
    console.log("onAlg", "onPuzzle");
  }

  algIssues(): Promise<AlgIssues> {
    // TODO: handle string sources to compare caononicalization.
    return (this.#algIssues ||= (async () => {
      const algIssues = new AlgIssues();
      try {
        const def = await this.puzzleSource.target.puzzleLoader.def();
        const kpuzzle = new KPuzzle(def);
        kpuzzle.applyAlg(this.algSource.target.alg);
      } catch (e) {
        algIssues.errors.push("Invalid alg!");
      }
      return algIssues;
    })());
  }
}

export class TwistyPlayerModel {
  algProp: AlgProp;
  puzzleProp: PuzzleProp;
  displayAlgProp: DisplayAlgProp;

  constructor() {
    this.algProp = new AlgProp();
    this.puzzleProp = new PuzzleProp();
    this.displayAlgProp = new DisplayAlgProp(this.algProp, this.puzzleProp);
  }
}
