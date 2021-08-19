import type { MillisecondTimestamp } from "../../../../animation/cursor/CursorTypes";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type TimestampRequest =
  | MillisecondTimestamp
  | "start"
  | "end"
  | "anchor"
  | "opposite-anchor";

export class TimestampRequestProp extends SimpleTwistyPropSource<TimestampRequest> {
  getDefaultValue(): TimestampRequest {
    return "opposite-anchor";
  }

  set(v: TimestampRequest) {
    super.set(v);
  }
}
