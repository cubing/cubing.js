import { Move } from "../../../../../alg";
import {
  combineTransformations,
  KPuzzleDefinition,
  transformationForMove,
} from "../../../../../kpuzzle";
import type { Transformation } from "../../../../../puzzle-geometry/interfaces";
import {
  Direction,
  MillisecondTimestamp,
  PuzzlePosition,
} from "../../../../animation/cursor/CursorTypes";
import type { AlgIndexer } from "../../../../animation/indexer/AlgIndexer";
import { TwistyPropDerived } from "../TwistyProp";

interface PositionPropInputs {
  setupTransformation: Transformation;
  indexer: AlgIndexer<any>;
  timestamp: MillisecondTimestamp;
  def: KPuzzleDefinition;
}

export class PositionProp extends TwistyPropDerived<
  PositionPropInputs,
  PuzzlePosition
> {
  derive(inputs: PositionPropInputs): PuzzlePosition {
    // Copied from AlgCursor
    if (inputs.indexer.timestampToPosition) {
      return inputs.indexer.timestampToPosition(
        inputs.timestamp,
        inputs.setupTransformation,
      );
    } else {
      const idx = inputs.indexer.timestampToIndex(inputs.timestamp);
      const state = inputs.indexer.stateAtIndex(
        idx,
        inputs.setupTransformation,
      ) as any; // TODO
      const position: PuzzlePosition = {
        state,
        movesInProgress: [],
      };

      if (inputs.indexer.numAnimatedLeaves() > 0) {
        const move = inputs.indexer.getMove(idx)?.as(Move);
        if (!move) {
          return {
            state,
            movesInProgress: [],
          };
        }
        const fraction =
          (inputs.timestamp - inputs.indexer.indexToMoveStartTimestamp(idx)) /
          inputs.indexer.moveDuration(idx);
        if (fraction === 1) {
          // TODO: push this into the indexer
          position.state = combineTransformations(
            inputs.def,
            state,
            transformationForMove(inputs.def, move),
          ) as Transformation;
        } else if (fraction > 0) {
          if (move) {
            position.movesInProgress.push({
              move,
              direction: Direction.Forwards,
              fraction,
            });
          }
        }
      }
      return position;
    }
  }
}
