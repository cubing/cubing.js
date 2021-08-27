import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
} from "../../../alg";
import type { Parsed } from "../../../alg/parse";
import type { AnimatedLeafUnit } from "../../old/animation/indexer/simultaneous-moves/simul-moves";

export type AnimatedLeafUnitInfo = {
  leaf: Parsed<AnimatedLeafUnit>;
  idx: number;
};
export type OrderedLeafTokens = AnimatedLeafUnitInfo[];

interface DataUp {
  tokens: OrderedLeafTokens;
  numLeavesInside: number;
}

interface DataDown {
  numMovesSofar: number;
}

class LeafTokens extends TraversalDownUp<DataDown, DataUp> {
  public traverseAlg(alg: Alg, dataDown: DataDown): DataUp {
    const unitArrays: OrderedLeafTokens[] = [];
    let numMovesInside = dataDown.numMovesSofar;
    for (const unit of alg.units()) {
      const dataUp = this.traverseUnit(unit, {
        numMovesSofar: dataDown.numMovesSofar + numMovesInside,
      });
      unitArrays.push(dataUp.tokens);
      numMovesInside += dataUp.numLeavesInside;
    }
    return {
      tokens: Array.prototype.concat(...unitArrays),
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

const leafTokensInstance = new LeafTokens();
export const leafTokens = leafTokensInstance.traverseAlg.bind(
  leafTokensInstance,
) as (alg: Parsed<Alg>, dataDown: DataDown) => DataUp;
