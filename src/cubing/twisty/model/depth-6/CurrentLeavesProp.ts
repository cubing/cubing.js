import { Move } from "../../../alg";
import { Direction } from "../../old/animation/cursor/CursorTypes";
import type {
  AlgIndexer,
  CurrentMoveInfo,
} from "../../old/animation/indexer/AlgIndexer";
import type { DetailedTimelineInfo } from "../depth-5/DetailedTimelineInfoProp";
import { TwistyPropDerived } from "../TwistyProp";

interface PositionPropInputs {
  indexer: AlgIndexer<any>;
  detailedTimelineInfo: DetailedTimelineInfo;
}

// TODO: Rename "current" (implies a single one) to "active"?
export class CurrentLeavesProp extends TwistyPropDerived<
  PositionPropInputs,
  CurrentMoveInfo
> {
  derive(inputs: PositionPropInputs): CurrentMoveInfo {
    // Copied from AlgCursor
    if (inputs.indexer.currentMoveInfo) {
      return inputs.indexer.currentMoveInfo(
        inputs.detailedTimelineInfo.timestamp,
      );
    } else {
      const idx = inputs.indexer.timestampToIndex(
        inputs.detailedTimelineInfo.timestamp,
      );
      const currentMoveInfo: CurrentMoveInfo = {
        stateIndex: idx,
        currentMoves: [],
        movesFinishing: [],
        movesStarting: [],
        latestStart: -Infinity,
        earliestEnd: Infinity,
      };

      if (inputs.indexer.numAnimatedLeaves() > 0) {
        const move = inputs.indexer.getMove(idx)?.as(Move);
        if (!move) {
          return currentMoveInfo;
        }
        const start = inputs.indexer.indexToMoveStartTimestamp(idx);
        const duration = inputs.indexer.moveDuration(idx);
        const fraction =
          (inputs.detailedTimelineInfo.timestamp - start) / duration;
        const end = start + duration;
        const currentMove = {
          move,
          direction: Direction.Forwards,
          fraction,
          startTimestamp: start,
          endTimestamp: end,
        };
        if (fraction === 0) {
          currentMoveInfo.movesStarting.push(currentMove);
          // // TODO: push this into the indexer
          // position.state = combineTransformations(
          //   inputs.def,
          //   state,
          //   transformationForMove(inputs.def, move),
          // ) as Transformation;
        } else if (fraction === 1) {
          currentMoveInfo.movesFinishing.push(currentMove);
          // // TODO: push this into the indexer
          // position.state = combineTransformations(
          //   inputs.def,
          //   state,
          //   transformationForMove(inputs.def, move),
          // ) as Transformation;
        } else {
          // TODO
          currentMoveInfo.currentMoves.push(currentMove);
          currentMoveInfo.latestStart = Math.max(
            currentMoveInfo.latestStart,
            start,
          );
          currentMoveInfo.earliestEnd = Math.min(
            currentMoveInfo.earliestEnd,
            end,
          );
        }
        // }
        // }
      }
      return currentMoveInfo;
    }
  }
}
