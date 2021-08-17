import { Move } from "../../../../../alg";
import {
  combineTransformations,
  KPuzzleDefinition,
  transformationForMove,
} from "../../../../../kpuzzle";
import type { Transformation } from "../../../../../puzzle-geometry/interfaces";
import {
  Direction,
  PuzzlePosition,
} from "../../../../animation/cursor/CursorTypes";
import type { AlgIndexer } from "../../../../animation/indexer/AlgIndexer";
import type { DetailedTimelineInfo } from "../depth-5/DetailedTimelineInfoProp";
import { TwistyPropDerived } from "../TwistyProp";

interface PositionPropInputs {
  anchoredStart: Transformation;
  indexer: AlgIndexer<any>;
  detailedTimelineInfo: DetailedTimelineInfo;
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
        inputs.detailedTimelineInfo.timestamp,
        inputs.anchoredStart,
      );
    } else {
      const idx = inputs.indexer.timestampToIndex(
        inputs.detailedTimelineInfo.timestamp,
      );
      const state = inputs.indexer.stateAtIndex(
        idx,
        inputs.anchoredStart,
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
          (inputs.detailedTimelineInfo.timestamp -
            inputs.indexer.indexToMoveStartTimestamp(idx)) /
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
