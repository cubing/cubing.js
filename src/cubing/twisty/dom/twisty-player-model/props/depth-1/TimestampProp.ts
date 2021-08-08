import type { MillisecondTimestamp } from "../../../../animation/cursor/CursorTypes";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class TimestampProp extends SimpleTwistyPropSource<MillisecondTimestamp> {
  getDefaultValue(): MillisecondTimestamp {
    return 0;
  }
}
