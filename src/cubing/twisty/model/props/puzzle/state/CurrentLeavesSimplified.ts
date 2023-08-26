import type { Move } from "../../../../../alg";
import type { CurrentMoveInfo } from "../../../../controllers/indexer/AlgIndexer";
import { arrayEqualsCompare } from "../../../helpers";
import { TwistyPropDerived } from "../../TwistyProp";

interface CurrentLeavesSimplifiedPropInputs {
  currentMoveInfo: CurrentMoveInfo;
}

export interface CurrentLeavesSimplified {
  patternIndex: number;
  movesFinishing: Move[];
  movesFinished: Move[];
}

// This started as a version of `CurrentLeaves` without highly timestamp-sensitive info like fractions, to enable easier caching.
export class CurrentLeavesSimplifiedProp extends TwistyPropDerived<
  CurrentLeavesSimplifiedPropInputs,
  CurrentLeavesSimplified
> {
  protected override derive(
    inputs: CurrentLeavesSimplifiedPropInputs,
  ): CurrentLeavesSimplified {
    return {
      patternIndex: inputs.currentMoveInfo.patternIndex,
      movesFinishing: inputs.currentMoveInfo.movesFinishing.map(
        (currentMoveInfo) => currentMoveInfo.move,
      ),
      movesFinished: inputs.currentMoveInfo.movesFinished.map(
        (currentMoveInfo) => currentMoveInfo.move,
      ),
    };
  }

  protected override canReuseValue(
    v1: CurrentLeavesSimplified,
    v2: CurrentLeavesSimplified,
  ): boolean {
    return (
      v1.patternIndex === v2.patternIndex &&
      arrayEqualsCompare(
        v1.movesFinishing,
        v2.movesFinishing,
        (m1: Move, m2: Move) => m1.isIdentical(m2),
      ) &&
      arrayEqualsCompare(
        v1.movesFinished,
        v2.movesFinished,
        (m1: Move, m2: Move) => m1.isIdentical(m2),
      )
    );
  }
}
