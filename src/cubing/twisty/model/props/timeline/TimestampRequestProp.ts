import type { MillisecondTimestamp } from "../../../controllers/AnimationTypes";
import { SimpleTwistyPropSource } from "../TwistyProp";

const smartTimestamps = {
  auto: true,
  start: true,
  end: true,
  anchor: true,
  "opposite-anchor": true,
};

export type TimestampRequest =
  | MillisecondTimestamp
  | keyof typeof smartTimestamps;

export class TimestampRequestProp extends SimpleTwistyPropSource<TimestampRequest> {
  override getDefaultValue(): TimestampRequest {
    return "auto";
  }

  // TODO: Support `Promise`
  public override set(v: TimestampRequest) {
    if (!this.validInput(v)) {
      // TODO: Generalize this to more props. How do we surface this? Throw an error and catch it from sync setters that call into this?
      return;
    }
    super.set(v);
  }

  protected validInput(v: TimestampRequest): boolean {
    if (typeof v === "number") {
      return true;
    }
    if (smartTimestamps[v]) {
      return true;
    }
    return false;
  }
}
