import type {
  LeafCount,
  LeafIndex,
} from "cubing/twisty/controllers/indexer/AlgIndexer";
import {
  type Alg,
  type Commutator,
  type Conjugate,
  functionFromTraversal,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalDownUp,
} from "../../../alg";
import type { Parsed } from "../../../alg/parseAlg";
import type { AnimatedLeafAlgNode } from "../../controllers/indexer/simultaneous-moves/simul-moves";

export type AnimatedLeafAlgNodeInfo = {
  leaf: Parsed<AnimatedLeafAlgNode>;
  idx: LeafIndex;
};
export type OrderedLeafTokens = AnimatedLeafAlgNodeInfo[];

interface DataUp {
  tokens: OrderedLeafTokens;
  numLeavesInside: LeafCount;
}

interface DataDown {
  numMovesSoFar: LeafCount;
}

class LeafTokens extends TraversalDownUp<DataDown, DataUp> {
  public traverseAlg(alg: Alg, dataDown: DataDown): DataUp {
    const algNodeArrays: OrderedLeafTokens[] = [];
    let numMovesInside = 0;
    for (const algNode of alg.childAlgNodes()) {
      const dataUp = this.traverseAlgNode(algNode, {
        numMovesSoFar: (dataDown.numMovesSoFar + numMovesInside) as LeafCount,
      });
      algNodeArrays.push(dataUp.tokens);
      numMovesInside += dataUp.numLeavesInside;
    }
    return {
      tokens: Array.prototype.concat(...algNodeArrays),
      numLeavesInside: numMovesInside as LeafCount,
    };
  }

  public traverseGrouping(grouping: Grouping, dataDown: DataDown): DataUp {
    const dataUp = this.traverseAlg(grouping.alg, dataDown);
    return {
      tokens: dataUp.tokens,
      numLeavesInside: (dataUp.numLeavesInside * grouping.amount) as LeafCount,
    };
  }

  public traverseMove(move: Move, dataDown: DataDown): DataUp {
    return {
      tokens: [
        {
          leaf: move as Parsed<Move>,
          idx: dataDown.numMovesSoFar as number as LeafIndex,
        },
      ],
      numLeavesInside: 1 as LeafCount,
    }; // TODO: What if not parsed?
  }

  public traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataUp {
    const dataUpA = this.traverseAlg(commutator.A, dataDown);
    const dataUpB = this.traverseAlg(commutator.B, {
      numMovesSoFar: (dataDown.numMovesSoFar +
        dataUpA.numLeavesInside) as LeafCount,
    });
    return {
      tokens: dataUpA.tokens.concat(dataUpB.tokens),
      numLeavesInside: (dataUpA.numLeavesInside * 2 +
        dataUpB.numLeavesInside) as LeafCount,
    };
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    const dataUpA = this.traverseAlg(conjugate.A, dataDown);
    const dataUpB = this.traverseAlg(conjugate.B, {
      numMovesSoFar: (dataDown.numMovesSoFar +
        dataUpA.numLeavesInside) as LeafCount,
    });
    return {
      tokens: dataUpA.tokens.concat(dataUpB.tokens),
      numLeavesInside: (dataUpA.numLeavesInside * 2 +
        dataUpB.numLeavesInside * 2) as LeafCount,
    };
  }

  public traversePause(pause: Pause, dataDown: DataDown): DataUp {
    return {
      tokens: [
        {
          leaf: pause as Parsed<Pause>,
          idx: dataDown.numMovesSoFar as number as LeafIndex,
        },
      ],
      numLeavesInside: 1 as LeafCount,
    }; // TODO: What if not parsed?
  }

  public traverseNewline(_newline: Newline, _dataDown: DataDown): DataUp {
    return {
      tokens: [],
      numLeavesInside: 0 as LeafCount,
    };
  }

  public traverseLineComment(
    _comment: LineComment,
    _dataDown: DataDown,
  ): DataUp {
    return {
      tokens: [],
      numLeavesInside: 0 as LeafCount,
    };
  }
}

export const leafTokens = functionFromTraversal(LeafTokens);
