import type { KPattern } from "../../../../../kpuzzle/KPattern";
import type { PuzzlePosition } from "../../../../controllers/AnimationTypes";
import type { CurrentMoveInfo } from "../../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";

export interface LegacyPositionPropInputs {
  currentMoveInfo: CurrentMoveInfo;
  currentPattern: KPattern;
}

// TODO: This exist as a convenience for old `Twisty3D` implementations. Get rid of this.
export class LegacyPositionProp extends TwistyPropDerived<
  LegacyPositionPropInputs,
  PuzzlePosition
> {
  derive(inputs: LegacyPositionPropInputs): PuzzlePosition {
    return {
      pattern: inputs.currentPattern,
      movesInProgress: inputs.currentMoveInfo.currentMoves,
    };
  }
}
