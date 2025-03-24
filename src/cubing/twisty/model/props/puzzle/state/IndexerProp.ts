import type { KPuzzle } from "../../../../../kpuzzle";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { AlgWithIssues } from "./AlgProp";
import type { AnimationTimelineLeaves } from "./AnimationTimelineLeavesRequestProp";
import type { IndexerConstructor } from "./IndexerConstructorProp";

type IndexerPropInputs = {
  indexerConstructor: IndexerConstructor;
  algWithIssues: AlgWithIssues;
  kpuzzle: KPuzzle;
  animationTimelineLeaves: AnimationTimelineLeaves | null;
};
export class IndexerProp extends TwistyPropDerived<
  IndexerPropInputs,
  AlgIndexer
> {
  derive(input: IndexerPropInputs): AlgIndexer {
    return new input.indexerConstructor(
      input.kpuzzle,
      input.algWithIssues.alg,
      { animationTimelineLeaves: input.animationTimelineLeaves },
    );
  }
}
