import type { TimeRange } from "../../../../animation/cursor/AlgCursor";
import type { MillisecondTimestamp } from "../../../../animation/cursor/CursorTypes";
import type { SetupToLocation } from "../../../TwistyPlayerConfig";
import type { TimestampRequest } from "../depth-1/TimestampRequestProp";
import { TwistyPropDerived } from "../TwistyProp";

interface EffectiveTimestampPropInputs {
  timestampRequest: TimestampRequest;
  timeRange: TimeRange;
  setupAnchor: SetupToLocation;
}

export interface EffectiveTimestamp {
  timestamp: MillisecondTimestamp;
  // Note: `atStart` and `atEnd` can both be true. This is the case with the
  // default (empty) alg, which has a duration of 0 ms.
  atStart: boolean;
  atEnd: boolean;
}

export class EffectiveTimestampProp extends TwistyPropDerived<
  EffectiveTimestampPropInputs,
  EffectiveTimestamp
> {
  derive(inputs: EffectiveTimestampPropInputs): EffectiveTimestamp {
    let timestamp = this.#requestedTimestampToMilliseconds(inputs);
    let atStart: boolean = false;
    let atEnd: boolean = false;
    if (timestamp >= inputs.timeRange.end) {
      atEnd = true;
      timestamp = Math.min(inputs.timeRange.end, timestamp);
    }
    if (timestamp <= inputs.timeRange.start) {
      atStart = true;
      timestamp = Math.max(inputs.timeRange.start, timestamp);
    }
    return {
      timestamp,
      atStart,
      atEnd,
    };
  }

  #requestedTimestampToMilliseconds(
    inputs: EffectiveTimestampPropInputs,
  ): MillisecondTimestamp {
    switch (inputs.timestampRequest) {
      case "start":
        return inputs.timeRange.start;
      case "end":
        return inputs.timeRange.end;
      case "anchor":
        return inputs.setupAnchor === "start"
          ? inputs.timeRange.start
          : inputs.timeRange.end;
      case "opposite-anchor":
        return inputs.setupAnchor === "start"
          ? inputs.timeRange.end
          : inputs.timeRange.start;
      default:
        return inputs.timestampRequest;
    }
  }
}
