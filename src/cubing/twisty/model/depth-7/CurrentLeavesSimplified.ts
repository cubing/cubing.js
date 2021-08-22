import type { Move } from "../../../alg";
import type { CurrentMoveInfo } from "../../old/animation/indexer/AlgIndexer";
import { arrayEqualsCompare } from "../helpers";
import { TwistyPropDerived } from "../TwistyProp";

interface CurrentLeavesSimplifiedPropInputs {
  currentMoveInfo: CurrentMoveInfo;
}

export interface CurrentLeavesSimplified {
  stateIndex: number;
  movesFinishing: Move[];
}

// This started as a version of `CurrentLeaves` without highly timestamp-sensitive info like fractions, to enable easier caching.
export class CurrentLeavesSimplifiedProp extends TwistyPropDerived<
  CurrentLeavesSimplifiedPropInputs,
  CurrentLeavesSimplified
> {
  // TODO: Figure out why this is still firing 6 times during stub demo loading.
  derive(inputs: CurrentLeavesSimplifiedPropInputs): CurrentLeavesSimplified {
    return {
      stateIndex: inputs.currentMoveInfo.stateIndex,
      movesFinishing: inputs.currentMoveInfo.movesFinishing.map(
        (currentMoveInfo) => currentMoveInfo.move,
      ),
    };
  }

  canReuse(v1: CurrentLeavesSimplified, v2: CurrentLeavesSimplified): boolean {
    return (
      v1.stateIndex === v2.stateIndex &&
      arrayEqualsCompare(
        v1.movesFinishing,
        v2.movesFinishing,
        (m1: Move, m2: Move) => m1.isIdentical(m2),
      )
    );
  }
}
