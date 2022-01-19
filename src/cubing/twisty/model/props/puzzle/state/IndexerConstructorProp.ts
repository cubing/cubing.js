import type { AlgIndexer } from "../../../..";
import type { Alg } from "../../../../../alg";
import type { KPuzzle } from "../../../../../kpuzzle";
import { countMoves } from "../../../../../notation";
import { SimpleAlgIndexer } from "../../../../controllers/indexer/SimpleAlgIndexer";
import { SimultaneousMoveIndexerV2 } from "../../../../controllers/indexer/simultaneous-moves/SimultaneousMoveIndexerV2";
import { TreeAlgIndexer } from "../../../../controllers/indexer/tree/TreeAlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { VisualizationStrategy } from "../../viewer/VisualizationStrategyProp";
import type { PuzzleID } from "../structure/PuzzleIDRequestProp";
import type { AlgWithIssues } from "./AlgProp";
import type { IndexerStrategyName } from "./IndexerConstructorRequestProp";

export type IndexerConstructor = new (kpuzzle: KPuzzle, alg: Alg) => AlgIndexer;

interface IndexerConstructorPropInputs {
  puzzle: PuzzleID;
  alg: AlgWithIssues;
  visualizationStrategy: VisualizationStrategy;
  indexerConstructorRequest: IndexerStrategyName;
}

// TODO: Also handle PG3D vs. 3D
export class IndexerConstructorProp extends TwistyPropDerived<
  IndexerConstructorPropInputs,
  IndexerConstructor
> {
  derive(inputs: IndexerConstructorPropInputs): IndexerConstructor {
    switch (inputs.indexerConstructorRequest) {
      case "auto":
        if (
          countMoves(inputs.alg.alg) < 100 &&
          inputs.puzzle === "3x3x3" &&
          inputs.visualizationStrategy === "Cube3D"
        ) {
          return SimultaneousMoveIndexerV2;
        } else {
          return TreeAlgIndexer;
        }
      case "tree":
        return TreeAlgIndexer;
      case "simple":
        return SimpleAlgIndexer;
      case "simultaneous":
        return SimultaneousMoveIndexerV2;
      default:
        throw new Error("Invalid indexer request!");
    }
  }
}
