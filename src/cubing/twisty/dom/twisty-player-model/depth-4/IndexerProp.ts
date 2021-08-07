import type { KPuzzleDefinition } from "../../../../kpuzzle";
import { KPuzzleWrapper } from "../../../3D/puzzles/KPuzzleWrapper";
import type { IndexerConstructor } from "../../../animation/cursor/AlgCursor";
import type { AlgIndexer } from "../../../animation/indexer/AlgIndexer";
import { TreeAlgIndexer } from "../../../animation/indexer/tree/TreeAlgIndexer";
import type { AlgWithIssues } from "../depth-1/AlgProp";
import { TwistyPropDerived } from "../TwistyProp";

type IndexerPropInputs = {
  indexerConstructor: IndexerConstructor;
  algWithIssues: AlgWithIssues;
  def: KPuzzleDefinition;
};
export class IndexerProp extends TwistyPropDerived<
  IndexerPropInputs,
  AlgIndexer<any>
> {
  #INDEXER_CONSTRUCTOR: IndexerConstructor = TreeAlgIndexer;

  derive(input: IndexerPropInputs): AlgIndexer<any> {
    const kpuzzleWrapper = new KPuzzleWrapper(input.def); // TODO: Remove this layer.
    console.log("constructor", this.#INDEXER_CONSTRUCTOR);
    return new this.#INDEXER_CONSTRUCTOR(
      kpuzzleWrapper,
      input.algWithIssues.alg,
    );
  }
}
