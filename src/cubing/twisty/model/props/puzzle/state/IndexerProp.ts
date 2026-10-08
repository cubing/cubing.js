import type { KPuzzle } from "../../../../../kpuzzle/index.ts";
import type { AlgIndexer } from "../../../../controllers/indexer/AlgIndexer.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";
import type { AlgWithIssues } from "./AlgProp.ts";
import type { AnimationTimelineLeaves } from "./AnimationTimelineLeavesRequestProp.ts";
import type { IndexerConstructor } from "./IndexerConstructorProp.ts";

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
