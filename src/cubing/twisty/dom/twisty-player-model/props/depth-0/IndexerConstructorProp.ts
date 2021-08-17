import type { IndexerConstructor } from "../../../../animation/cursor/AlgCursor";
import { SimpleAlgIndexer } from "../../../../animation/indexer/SimpleAlgIndexer";
import { SimultaneousMoveIndexer } from "../../../../animation/indexer/simultaneous-moves/SimultaneousMoveIndexer";
import { TreeAlgIndexer } from "../../../../animation/indexer/tree/TreeAlgIndexer";
import { TwistyPropSource } from "../TwistyProp";

type IndexerStrategyName = "simple" | "tree" | "simultaneous";

export class IndexerConstructorProp extends TwistyPropSource<
  IndexerConstructor,
  IndexerStrategyName
> {
  getDefaultValue(): IndexerConstructor {
    return TreeAlgIndexer;
  }

  derive(strategyName: IndexerStrategyName): IndexerConstructor {
    switch (strategyName) {
      case "simple":
        return SimpleAlgIndexer;
      case "simultaneous":
        return SimultaneousMoveIndexer;
      case "tree":
        return TreeAlgIndexer;
      default:
        throw new Error("Invalid Indexer!");
    }
  }
}
