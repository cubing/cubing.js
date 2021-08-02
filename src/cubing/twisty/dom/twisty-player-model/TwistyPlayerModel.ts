import { PuzzleLoader, puzzles } from "../../..//puzzles";
import type { Alg } from "../../../alg";

import { KPuzzle } from "../../../kpuzzle";
import type { PuzzleID } from "../TwistyPlayerConfig";
import { AlgIssues, AlgProp } from "./AlgProp";
import { ManagedSource } from "./ManagedSource";

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
    // console.log("onAlg");
    this.#algIssues = null;
  }

  onPuzzle() {
    // console.log("onPuzzle");
    this.#algIssues = null;
  }

  algIssues(): Promise<AlgIssues> {
    // TODO: handle string sources to compare caononicalization.
    return (this.#algIssues ||= (async () => {
      const algIssues = this.algSource.target.algIssues.clone();
      // console.log("dfdf", this.algSource.target.algIssues === algIssues);
      try {
        const alg = this.algSource.target.alg; // TODO: Can we get a frozen reference before doing anything async?
        const def = await this.puzzleSource.target.puzzleLoader.def();
        const kpuzzle = new KPuzzle(def);
        kpuzzle.applyAlg(alg);
      } catch (e) {
        algIssues.errors.push(`Invalid alg for puzzle: ${e}`);
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

  set alg(newAlg: Alg | string) {
    this.algProp.alg = newAlg;
  }

  get alg(): Alg {
    return this.algProp.alg;
  }

  set puzzleID(puzzleID: PuzzleID) {
    this.puzzleProp.puzzleID = puzzleID;
  }

  get puzzleID(): PuzzleID {
    return this.puzzleProp.puzzleID;
  }

  get puzzleLoader(): PuzzleLoader {
    return this.puzzleProp.puzzleLoader;
  }

  algIssues(): Promise<AlgIssues> {
    return this.displayAlgProp.algIssues();
  }
}
