import type { KPattern } from "../../../../../kpuzzle/KPattern.ts";
import type { PuzzlePosition } from "../../../../controllers/AnimationTypes.ts";
import type { CurrentMoveInfo } from "../../../../controllers/indexer/AlgIndexer.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";

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
