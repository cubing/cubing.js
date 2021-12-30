import type { TimeRange } from "../../../controllers/AnimationTypes";
import type { AlgIndexer } from "../../../controllers/indexer/AlgIndexer";
import { TwistyPropDerived } from "../TwistyProp";

export class TimeRangeProp extends TwistyPropDerived<
  { indexer: AlgIndexer<any> },
  TimeRange
> {
  derive(inputs: { indexer: AlgIndexer<any> }): TimeRange {
    return {
      start: 0,
      end: inputs.indexer.algDuration(),
    };
  }
}
