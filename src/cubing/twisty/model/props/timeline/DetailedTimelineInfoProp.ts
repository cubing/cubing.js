import type {
  MillisecondTimestamp,
  TimeRange,
} from "../../../controllers/AnimationTypes";
import type { AlgWithIssues } from "../puzzle/state/AlgProp";
import type { SetupToLocation } from "../puzzle/state/SetupAnchorProp";
import { TwistyPropDerived } from "../TwistyProp";
import type { TimestampRequest } from "./TimestampRequestProp";

interface DetailedTimelineInfoInputs {
  timestampRequest: TimestampRequest;
  timeRange: TimeRange;
  setupAnchor: SetupToLocation;
  setupAlg: AlgWithIssues;
}

export interface DetailedTimelineInfo {
  timestamp: MillisecondTimestamp;
  timeRange: TimeRange; // TODO: Don't incluede this, and let fresh listeners listen to multiple inputs?
  // Note: `atStart` and `atEnd` can both be true. This is the case with the
  // default (empty) alg, which has a duration of 0 ms.
  atStart: boolean;
  atEnd: boolean;
}

export class DetailedTimelineInfoProp extends TwistyPropDerived<
  DetailedTimelineInfoInputs,
  DetailedTimelineInfo
> {
  protected override derive(
    inputs: DetailedTimelineInfoInputs,
  ): DetailedTimelineInfo {
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
      timeRange: inputs.timeRange,
      atStart,
      atEnd,
    };
  }

  #requestedTimestampToMilliseconds(
    inputs: DetailedTimelineInfoInputs,
  ): MillisecondTimestamp {
    switch (inputs.timestampRequest) {
      case "auto":
        return inputs.setupAnchor === "start" &&
          inputs.setupAlg.alg.experimentalIsEmpty()
          ? inputs.timeRange.end
          : inputs.timeRange.start;
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

  protected override canReuseValue(
    v1: DetailedTimelineInfo,
    v2: DetailedTimelineInfo,
  ) {
    return (
      v1.timestamp === v2.timestamp &&
      v1.timeRange.start === v2.timeRange.start &&
      v1.timeRange.end === v2.timeRange.end &&
      v1.atStart === v2.atStart &&
      v1.atEnd === v2.atEnd
    );
  }
}
