import type { Alg } from "../../../../../alg/index.ts";
import type { KPuzzle } from "../../../../../kpuzzle/index.ts";
import { countLeavesInExpansionForSimultaneousMoveIndexer } from "../../../../../notation/CountMoves.ts";
import { SimpleAlgIndexer } from "../../../../controllers/indexer/SimpleAlgIndexer.ts";
import { SimultaneousMoveIndexer } from "../../../../controllers/indexer/simultaneous-moves/SimultaneousMoveIndexer.ts";
import { TreeAlgIndexer } from "../../../../controllers/indexer/tree/TreeAlgIndexer.ts";
import type { AlgIndexer } from "../../../../index.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";
import type { VisualizationStrategy } from "../../viewer/VisualizationStrategyProp.ts";
import type { PuzzleID } from "../structure/PuzzleIDRequestProp.ts";
import type { AlgWithIssues } from "./AlgProp.ts";
import type { AnimationTimelineLeaves } from "./AnimationTimelineLeavesRequestProp.ts";
import type { IndexerStrategyName } from "./IndexerConstructorRequestProp.ts";

export type IndexerConstructor = new (
  kpuzzle: KPuzzle,
  alg: Alg,
  options?: {
    animationTimelineLeaves?: AnimationTimelineLeaves | null;
  },
) => AlgIndexer;

interface IndexerConstructorPropInputs {
  puzzle: PuzzleID;
  alg: AlgWithIssues;
  visualizationStrategy: VisualizationStrategy;
  indexerConstructorRequest: IndexerStrategyName;
  animationTimelineLeaves: AnimationTimelineLeaves | null;
}

// `SimultaneousMoveIndexer` is currently not optimized and has to expand the alg. This bounds the number of moves in the expanded alg.
const SIMULTANEOUS_INDEXER_MAX_EXPANDED_LEAVES = 1024;

// TODO: Also handle PG3D vs. 3D
export class IndexerConstructorProp extends TwistyPropDerived<
  IndexerConstructorPropInputs,
  IndexerConstructor
> {
  derive(inputs: IndexerConstructorPropInputs): IndexerConstructor {
    switch (inputs.indexerConstructorRequest) {
      case "auto":
        if (inputs.animationTimelineLeaves !== null) {
          return SimultaneousMoveIndexer;
        }
        if (
          countLeavesInExpansionForSimultaneousMoveIndexer(inputs.alg.alg) <=
            SIMULTANEOUS_INDEXER_MAX_EXPANDED_LEAVES &&
          inputs.puzzle === "3x3x3" &&
          inputs.visualizationStrategy === "Cube3D"
        ) {
          return SimultaneousMoveIndexer;
        } else {
          return TreeAlgIndexer;
        }
      case "tree":
        return TreeAlgIndexer;
      case "simple":
        return SimpleAlgIndexer;
      case "simultaneous":
        return SimultaneousMoveIndexer;
      default:
        throw new Error("Invalid indexer request!");
    }
  }
}
