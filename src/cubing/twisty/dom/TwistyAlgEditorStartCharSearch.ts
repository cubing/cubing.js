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
} from "../../alg";
import type { Parsed } from "../../alg/parse";

type AnimatedLeafUnit = Move | Pause;

interface DataDown {
  targetCharIdx: number;
  numMovesSofar: number;
}

type DataUp =
  | {
      latestUnit: Parsed<AnimatedLeafUnit>;
      animatedMoveIdx: number;
    }
  | { animatedMoveCount: number };

export class TwistyAlgEditorCharSearch extends TraversalDownUp<
  DataDown,
  DataUp
> {
  traverseAlg(alg: Alg, dataDown: DataDown): DataUp {
    let numMovesSofar: number = dataDown.numMovesSofar;
    for (const unit of alg.units()) {
      const newDown: DataDown = {
        targetCharIdx: dataDown.targetCharIdx,
        numMovesSofar,
      };
      const dataUp = this.traverseUnit(unit, newDown);
      if ("latestUnit" in dataUp) {
        return dataUp;
      }
      numMovesSofar += dataUp.animatedMoveCount;
    }
    return { animatedMoveCount: numMovesSofar - dataDown.numMovesSofar };
  }

  traverseGrouping(grouping: Grouping, dataDown: DataDown): DataUp {
    const dataUp = this.traverseAlg(grouping.alg, dataDown);
    if ("latestUnit" in dataUp) {
      return dataUp;
    }
    return {
      animatedMoveCount: dataUp.animatedMoveCount * Math.abs(grouping.amount),
    };
  }

  traverseMove(move: Move, dataDown: DataDown): DataUp {
    const asParsed = move as Parsed<Move>; // TODO: handle non-parsed?
    // console.log(dataDown, move.toString(), asParsed.startCharIndex);
    if (asParsed.endCharIndex > dataDown.targetCharIdx) {
      return {
        latestUnit: asParsed,
        animatedMoveIdx: dataDown.numMovesSofar,
      };
    }
    return {
      animatedMoveCount: 1,
    };
  }

  traverseCommutator(commutator: Commutator, dataDown: DataDown): DataUp {
    const dataUpA = this.traverseAlg(commutator.A, dataDown);
    if ("latestUnit" in dataUpA) {
      return dataUpA;
    }
    const dataDownB: DataDown = {
      targetCharIdx: dataDown.targetCharIdx,
      numMovesSofar: dataDown.numMovesSofar + dataUpA.animatedMoveCount,
    };
    const dataUpB = this.traverseAlg(commutator.B, dataDownB);
    if ("latestUnit" in dataUpB) {
      return dataUpB;
    }
    return {
      animatedMoveCount:
        2 * (dataUpA.animatedMoveCount + dataUpB.animatedMoveCount),
    };
  }

  // TODO: share impl with comm
  traverseConjugate(conjugate: Conjugate, dataDown: DataDown): DataUp {
    const dataUpA = this.traverseAlg(conjugate.A, dataDown);
    if ("latestUnit" in dataUpA) {
      return dataUpA;
    }
    const dataDownB: DataDown = {
      targetCharIdx: dataDown.targetCharIdx,
      numMovesSofar: dataDown.numMovesSofar + dataUpA.animatedMoveCount,
    };
    const dataUpB = this.traverseAlg(conjugate.B, dataDownB);
    if ("latestUnit" in dataUpB) {
      return dataUpB;
    }
    return {
      animatedMoveCount:
        dataUpA.animatedMoveCount * 2 + dataUpB.animatedMoveCount,
    };
  }

  // TODO: share impl with move?
  traversePause(pause: Pause, dataDown: DataDown): DataUp {
    const asParsed = pause as Parsed<Pause>; // TODO: handle non-parsed?
    if (asParsed.endCharIndex > dataDown.targetCharIdx) {
      return {
        latestUnit: asParsed,
        animatedMoveIdx: dataDown.numMovesSofar,
      };
    }
    return {
      animatedMoveCount: 1,
    };
  }

  traverseNewline(_newline: Newline, _dataDown: DataDown): DataUp {
    return { animatedMoveCount: 0 };
  }

  traverseLineComment(_comment: LineComment, _dataDown: DataDown): DataUp {
    return { animatedMoveCount: 0 };
  }
}

const TwistyAlgEditorCharSearchInstance = new TwistyAlgEditorCharSearch();
export const twistyAlgEditorCharSearch =
  TwistyAlgEditorCharSearchInstance.traverseAlg.bind(
    TwistyAlgEditorCharSearchInstance,
  ) as (alg: Alg, dataDown: DataDown) => DataUp;
