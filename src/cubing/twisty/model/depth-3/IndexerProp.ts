import type { KPuzzleDefinition } from "../../../kpuzzle";
import { KPuzzleWrapper } from "../../views/3D/puzzles/KPuzzleWrapper";
import type { IndexerConstructor } from "../../old/animation/cursor/AlgCursor";
import type { AlgIndexer } from "../../old/animation/indexer/AlgIndexer";
import type { AlgWithIssues } from "../depth-0/AlgProp";
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
  name = "indexer";

  derive(input: IndexerPropInputs): AlgIndexer<any> {
    const kpuzzleWrapper = new KPuzzleWrapper(input.def); // TODO: Remove this layer.
    return new input.indexerConstructor(
      kpuzzleWrapper,
      input.algWithIssues.alg,
    );
  }
}
