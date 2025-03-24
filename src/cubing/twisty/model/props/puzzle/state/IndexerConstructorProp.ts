import type { AlgIndexer } from "../../../..";
import type { Alg } from "../../../../../alg";
import type { KPuzzle } from "../../../../../kpuzzle";
import { countLeavesInExpansionForSimultaneousMoveIndexer } from "../../../../../notation/CountMoves";
import { SimpleAlgIndexer } from "../../../../controllers/indexer/SimpleAlgIndexer";
import { SimultaneousMoveIndexer } from "../../../../controllers/indexer/simultaneous-moves/SimultaneousMoveIndexer";
import { TreeAlgIndexer } from "../../../../controllers/indexer/tree/TreeAlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { VisualizationStrategy } from "../../viewer/VisualizationStrategyProp";
import type { PuzzleID } from "../structure/PuzzleIDRequestProp";
import type { AlgWithIssues } from "./AlgProp";
import type { AnimationTimelineLeaves } from "./AnimationTimelineLeavesRequestProp";
import type { IndexerStrategyName } from "./IndexerConstructorRequestProp";

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
