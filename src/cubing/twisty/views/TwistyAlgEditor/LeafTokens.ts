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
  idx: number;
};
export type OrderedLeafTokens = AnimatedLeafAlgNodeInfo[];

interface DataUp {
  tokens: OrderedLeafTokens;
  numLeavesInside: number;
}

interface DataDown {
  numMovesSofar: number;
}

class LeafTokens extends TraversalDownUp<DataDown, DataUp> {
  public traverseAlg(alg: Alg, dataDown: DataDown): DataUp {
    const algNodeArrays: OrderedLeafTokens[] = [];
    let numMovesInside = 0;
    for (const algNode of alg.childAlgNodes()) {
      const dataUp = this.traverseAlgNode(algNode, {
        numMovesSofar: dataDown.numMovesSofar + numMovesInside,
      });
      algNodeArrays.push(dataUp.tokens);
      numMovesInside += dataUp.numLeavesInside;
    }
    return {
      tokens: Array.prototype.concat(...algNodeArrays),
      numLeavesInside: numMovesInside,
    };
  }

  public traverseGrouping(grouping: Grouping, dataDown: DataDown): DataUp {
    const dataUp = this.traverseAlg(grouping.alg, dataDown);
    return {
      tokens: dataUp.tokens,
      numLeavesInside: dataUp.numLeavesInside * grouping.amount,
    };
  }

  public traverseMove(move: Move, dataDown: DataDown): DataUp {
    return {
      tokens: [{ leaf: move as Parsed<Move>, idx: dataDown.numMovesSofar }],
      numLeavesInside: 1,
    }; // TODO: What if not parsed?
  }

  public traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataUp {
    const dataUpA = this.traverseAlg(commutator.A, dataDown);
    const dataUpB = this.traverseAlg(commutator.B, {
      numMovesSofar: dataDown.numMovesSofar + dataUpA.numLeavesInside,
    });
    return {
      tokens: dataUpA.tokens.concat(dataUpB.tokens),
      numLeavesInside: dataUpA.numLeavesInside * 2 + dataUpB.numLeavesInside,
    };
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    const dataUpA = this.traverseAlg(conjugate.A, dataDown);
    const dataUpB = this.traverseAlg(conjugate.B, {
      numMovesSofar: dataDown.numMovesSofar + dataUpA.numLeavesInside,
    });
    return {
      tokens: dataUpA.tokens.concat(dataUpB.tokens),
      numLeavesInside:
        dataUpA.numLeavesInside * 2 + dataUpB.numLeavesInside * 2,
    };
  }

  public traversePause(pause: Pause, dataDown: DataDown): DataUp {
    return {
      tokens: [{ leaf: pause as Parsed<Pause>, idx: dataDown.numMovesSofar }],
      numLeavesInside: 1,
    }; // TODO: What if not parsed?
  }

  public traverseNewline(_newline: Newline, _dataDown: DataDown): DataUp {
    return {
      tokens: [],
      numLeavesInside: 0,
    };
  }

  public traverseLineComment(
    _comment: LineComment,
    _dataDown: DataDown,
  ): DataUp {
    return {
      tokens: [],
      numLeavesInside: 0,
    };
  }
}

export const leafTokens = functionFromTraversal(LeafTokens);
