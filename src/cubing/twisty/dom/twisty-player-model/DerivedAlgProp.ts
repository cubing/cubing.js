import { Alg } from "../../../alg";
import { KPuzzle } from "../../../kpuzzle";
import type { AlgIssues, AlgProp } from "./AlgProp";
import { ManagedSource } from "./ManagedSource";
import type { PuzzleProp } from "./PuzzleProp";

interface DerivedAlgInfo {
  alg: Alg;
  algIssues: AlgIssues;
}

export class DerivedAlgProp extends EventTarget {
  algSource: ManagedSource<AlgProp>;

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
    console.log("DerivedAlgProp.onAlg");
    this.#cachedDerivedAlgInfo = null;
    this.dispatchEvent(new CustomEvent("update"));
  }

  onPuzzle() {
    this.#cachedDerivedAlgInfo = null;
    this.dispatchEvent(new CustomEvent("update"));
  }

  async alg(): Promise<Alg> {
    return (await this.#derive()).alg;
  }

  async algIssues(): Promise<AlgIssues> {
    // TODO: handle string sources to compare caononicalization.
    return (await this.#derive()).algIssues;
  }

  #cachedDerivedAlgInfo: Promise<DerivedAlgInfo> | null = null;
  async #derive(): Promise<DerivedAlgInfo> {
    return (this.#cachedDerivedAlgInfo ??=
      (async (): Promise<DerivedAlgInfo> => {
        console.log("DerivedAlgProp deriving!");
        const algIssues = this.algSource.target.algIssues.clone();
        let alg: Alg | null = null;
        try {
          const maybeAlg = this.algSource.target.alg; // TODO: Can we get a frozen reference before doing anything async?
          const def = await this.puzzleSource.target.puzzleLoader.def();
          const kpuzzle = new KPuzzle(def);
          kpuzzle.applyAlg(maybeAlg);
          // Looks like we could apply the alg!
          alg = maybeAlg;
        } catch (e) {
          algIssues.errors.push(`Invalid alg for puzzle: ${e}`);
        }
        return { alg: alg ?? new Alg(), algIssues };
      })());
  }
}
