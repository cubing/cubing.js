import type { TimeRange } from "../../../animation/cursor/AlgCursor";
import type { AlgIndexer } from "../../../animation/indexer/AlgIndexer";
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
