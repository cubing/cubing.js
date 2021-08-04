import {
  KPuzzle,
  KPuzzleDefinition,
  Transformation,
} from "../../../../kpuzzle";
import { KPuzzleWrapper } from "../../../3D/puzzles/KPuzzleWrapper";
import type { IndexerConstructor } from "../../../animation/cursor/AlgCursor";
import type { AlgIndexer } from "../../../animation/indexer/AlgIndexer";
import { TreeAlgIndexer } from "../../../animation/indexer/tree/TreeAlgIndexer";
import type { SetupToLocation } from "../../TwistyPlayerConfig";
import type { PuzzleProp } from "../depth-1/PuzzleProp";
import type { PuzzleAlgProp } from "../depth-2/PuzzleAlgProp";
import { ManagedSource } from "../ManagedSource";
import { TwistyProp } from "../TwistyProp";

export class PositionProp extends TwistyProp {
  #puzzleAlgProp: ManagedSource<PuzzleAlgProp>;
  #puzzleSetupProp: ManagedSource<PuzzleAlgProp>;
  #puzzleProp: ManagedSource<PuzzleProp>;
  TODO_ANCHOR: SetupToLocation = "end";

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
    console.log("PositionProp.onAlg");
    this.#cachedStartState = null;
    this.dispatch();
  }

  async onSetup(): Promise<void> {
    this.#cachedStartState = null;
    console.log("PositionProp.onSetup");
    this.dispatch();
  }

  onPuzzle(): void {
    this.#cachedStartState = null;
    this.#cachedKPuzzleDefinition = null;
    console.log("PositionProp.onPuzzle");
    this.dispatch();
  }

  // async position(): Promise<PuzzlePosition> {
  //   throw new Error("Unipmlemented!");
  // }

  #cachedStartState: Promise<Transformation> | null = null;
  #cachedKPuzzleDefinition: Promise<KPuzzleDefinition> | null = null;
  startState(): Promise<Transformation> {
    this.#cachedKPuzzleDefinition ??=
      this.#puzzleProp.target.puzzleLoader.def();
    return (this.#cachedStartState ??= (async () => {
      const kpuzzle = new KPuzzle(await this.#cachedKPuzzleDefinition!); // TODO: HOw can we make this easy and safe to reuse?
      // TODO: It's not
      // kpuzzle.reset();
      kpuzzle.applyAlg(await this.#puzzleSetupProp.target.alg()); // TODO: do we have to pull retrieve this value earlier to avoid e.g. puzzle consistency issues?
      if (this.TODO_ANCHOR === "end") {
        kpuzzle.applyAlg((await this.#puzzleAlgProp.target.alg()).invert()); // TODO: do we have to pull retrieve this value earlier to avoid e.g. puzzle consistency issues?
      }
      return kpuzzle.state;
    })());
  }

  #cachedIndexer: Promise<AlgIndexer<KPuzzleWrapper>> | null = null;
  #INDEXER_CONSTRUCTOR: IndexerConstructor = TreeAlgIndexer;
  async indexer(): Promise<AlgIndexer<KPuzzleWrapper>> {
    return (this.#cachedIndexer ??= (async () => {
      const [alg, puzzle] = await Promise.all([
        this.#puzzleAlgProp.target.alg(),
        this.#puzzleProp.target.puzzleLoader.def(),
      ]);
      const kpuzzleWrapper = new KPuzzleWrapper(puzzle); // TODO: remove this level
      return new this.#INDEXER_CONSTRUCTOR(kpuzzleWrapper, alg);
    })());
  }
}
