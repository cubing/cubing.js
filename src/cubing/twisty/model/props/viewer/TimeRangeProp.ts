import type {
  MillisecondTimestamp,
  TimeRange,
} from "../../../controllers/AnimationTypes";
import type { AlgIndexer } from "../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../TwistyProp";

export class TimeRangeProp extends TwistyPropDerived<
  { indexer: AlgIndexer },
  TimeRange
> {
  derive(inputs: { indexer: AlgIndexer }): TimeRange {
    return {
      start: 0 as MillisecondTimestamp,
      end: inputs.indexer.algDuration() as number as MillisecondTimestamp,
    };
  }
}
