import { PuzzleLoader, puzzles } from "../../..//puzzles";

import { Alg } from "../../../alg";
import { KPuzzle } from "../../../kpuzzle";
import type { PuzzleID } from "../TwistyPlayerConfig";

// TODO: add stale marker?
class ManagedSource<T extends EventTarget> extends EventTarget {
  #target: T; // TODO: | null
  constructor(target: T, private listener: () => {}) {
    super();
    // this.set(target);
    this.#target = target;
    this.#target.addEventListener("update", this.listener);
  }

  get target(): T {
    return this.#target;
  }

  // clear(): void {
  //   this.#target.removeEventListener("update", this.listener);
  // }

  // set(target: T): void {
  //   this.clear();
  //   this.#target.addEventListener("update", this.listener);
  //   this.#target = target;
  // }
}

class AlgProp extends EventTarget {
  #alg: Alg = new Alg();
  #cachedAlgIssues: AlgIssues | null = null;

  set alg(newAlg: Alg) {
    // if (!this.#alg.isIdentical(newAlg)) { // TODO: is this the right way?
    this.#alg = newAlg;
    this.#cachedAlgIssues = null;
    this.dispatchEvent(new CustomEvent("update"));
    // }
  }

  setFromString(newAlgString: string) {
    console.log("fromstring!");
    try {
      this.#alg = new Alg(newAlgString);
      if (this.#alg.toString() !== newAlgString) {
        this.#cachedAlgIssues = new AlgIssues();
        this.#cachedAlgIssues.warnings.push(`Alg is non-canonical!`);
      }
    } catch (e) {
      this.#alg = new Alg(); // TODO
      this.#cachedAlgIssues = new AlgIssues();
      this.#cachedAlgIssues.errors.push(`Invalid alg: ${e}`);
    }
  }

  get alg(): Alg {
    return this.#alg;
  }

  get algIssues(): AlgIssues {
    return (this.#cachedAlgIssues ||= new AlgIssues());
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
  // TODO: (string | Error)[]
  warnings: string[] = [];
  errors: string[] = [];

  clone() {
    const newAlgIssues = new AlgIssues();
    newAlgIssues.warnings = this.warnings.slice();
    newAlgIssues.errors = this.errors.slice();
    console.log("clone");
    return newAlgIssues;
  }
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
    console.log("onAlg");
    this.#algIssues = null;
  }

  onPuzzle() {
    console.log("onAlg");
  }

  algIssues(): Promise<AlgIssues> {
    // TODO: handle string sources to compare caononicalization.
    return (this.#algIssues ||= (async () => {
      const algIssues = this.algSource.target.algIssues.clone();
      console.log("dfdf", this.algSource.target.algIssues === algIssues);
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
