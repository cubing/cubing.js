import { Move } from "../../../../../alg";
import { Direction } from "../../../../controllers/AnimationTypes";
import type {
  AlgIndexer,
  CurrentMoveInfo,
} from "../../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../../TwistyProp";
import type { DetailedTimelineInfo } from "../../timeline/DetailedTimelineInfoProp";
import type { CatchUpMove } from "./CatchUpMoveProp";

interface PositionPropInputs {
  indexer: AlgIndexer;
  detailedTimelineInfo: DetailedTimelineInfo;
  catchUpMove: CatchUpMove;
}

// TODO: Rename "current" (implies a single one) to "active"?
export class CurrentMoveInfoProp extends TwistyPropDerived<
  PositionPropInputs,
  CurrentMoveInfo
> {
  derive(inputs: PositionPropInputs): CurrentMoveInfo {
    function addCatchUpMove(currentMoveInfo: CurrentMoveInfo): CurrentMoveInfo {
      if (
        inputs.detailedTimelineInfo.atEnd &&
        inputs.catchUpMove.move !== null
      ) {
        currentMoveInfo.currentMoves.push({
          move: inputs.catchUpMove.move,
          direction: Direction.Backwards,
          fraction: 1 - inputs.catchUpMove.amount,
          startTimestamp: -1, // TODO
          endTimestamp: -1, // TODO
        });
      }
      return currentMoveInfo;
    }

    // Copied from AlgCursor
    if (inputs.indexer.currentMoveInfo) {
      return addCatchUpMove(
        inputs.indexer.currentMoveInfo(inputs.detailedTimelineInfo.timestamp),
      );
    } else {
      const idx = inputs.indexer.timestampToIndex(
        inputs.detailedTimelineInfo.timestamp,
      );
      const currentMoveInfo: CurrentMoveInfo = {
        patternIndex: idx,
        currentMoves: [],
        movesFinishing: [],
        movesFinished: [],
        movesStarting: [],
        latestStart: -Infinity,
        earliestEnd: Infinity,
      };

      if (inputs.indexer.numAnimatedLeaves() > 0) {
        const move = inputs.indexer.getAnimLeaf(idx)?.as(Move);
        if (!move) {
          return addCatchUpMove(currentMoveInfo);
        }
        const start = inputs.indexer.indexToMoveStartTimestamp(idx);
        const duration = inputs.indexer.moveDuration(idx);
        const fraction = duration
          ? (inputs.detailedTimelineInfo.timestamp - start) / duration
          : 0;
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
      return addCatchUpMove(currentMoveInfo);
    }
  }
}
