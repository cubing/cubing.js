import { Move } from "../../../../../alg";
import { Direction } from "../../../../animation/cursor/CursorTypes";
import type {
  AlgIndexer,
  CurrentMoveInfo,
} from "../../../../animation/indexer/AlgIndexer";
import type { DetailedTimelineInfo } from "../depth-5/DetailedTimelineInfoProp";
import { TwistyPropDerived } from "../TwistyProp";

interface PositionPropInputs {
  indexer: AlgIndexer<any>;
  detailedTimelineInfo: DetailedTimelineInfo;
}

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
        // if (fraction === 1) {
        //   // // TODO: push this into the indexer
        //   // position.state = combineTransformations(
        //   //   inputs.def,
        //   //   state,
        //   //   transformationForMove(inputs.def, move),
        //   // ) as Transformation;
        // } else if (fraction >= 0) {
        // if (move) {
        if (fraction < 1) {
          // TODO
          currentMoveInfo.currentMoves.push({
            move,
            direction: Direction.Forwards,
            fraction,
            startTimestamp: start,
            endTimestamp: end,
          });
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
