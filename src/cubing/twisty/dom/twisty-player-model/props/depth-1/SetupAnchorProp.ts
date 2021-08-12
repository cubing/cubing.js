import type { SetupToLocation } from "../../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class SetupAnchorProp extends SimpleTwistyPropSource<SetupToLocation> {
  getDefaultValue(): SetupToLocation {
    return "start";
  }
}
