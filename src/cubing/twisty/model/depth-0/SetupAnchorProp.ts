import type { SetupToLocation } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class SetupAnchorProp extends SimpleTwistyPropSource<SetupToLocation> {
  name = "setup anchor";

  getDefaultValue(): SetupToLocation {
    return "start";
  }
}
