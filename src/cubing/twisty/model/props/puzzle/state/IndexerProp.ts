import type { OldKPuzzleDefinition } from "../../../../../kpuzzle";
import { KPuzzleWrapper } from "../../../../views/3D/puzzles/KPuzzleWrapper";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer";
import type { AlgWithIssues } from "./AlgProp";
import { TwistyPropDerived } from "../../TwistyProp";
import type { IndexerConstructor } from "./IndexerConstructorProp";

type IndexerPropInputs = {
  indexerConstructor: IndexerConstructor;
  algWithIssues: AlgWithIssues;
  def: OldKPuzzleDefinition;
};
export class IndexerProp extends TwistyPropDerived<
  IndexerPropInputs,
  AlgIndexer<any>
> {
  derive(input: IndexerPropInputs): AlgIndexer<any> {
    const kpuzzleWrapper = new KPuzzleWrapper(input.def); // TODO: Remove this layer.
    return new input.indexerConstructor(
      kpuzzleWrapper,
      input.algWithIssues.alg,
    );
  }
}
