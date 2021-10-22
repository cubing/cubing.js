import type { Transformation } from "../../../kpuzzle";
import type { PuzzlePosition } from "../../old/animation/cursor/CursorTypes";
import type { CurrentMoveInfo } from "../../old/animation/indexer/AlgIndexer";
import { TwistyPropDerived } from "../TwistyProp";

export interface LegacyPositionPropInputs {
  currentMoveInfo: CurrentMoveInfo;
  transformation: Transformation;
}

// TODO: This exist as a convenience for old `Twisty3D` implementations. Get rid of this.
export class LegacyPositionProp extends TwistyPropDerived<
  LegacyPositionPropInputs,
  PuzzlePosition
> {
  derive(inputs: LegacyPositionPropInputs): PuzzlePosition {
    return {
      state: inputs.transformation,
      movesInProgress: inputs.currentMoveInfo.currentMoves,
    };
  }
}
