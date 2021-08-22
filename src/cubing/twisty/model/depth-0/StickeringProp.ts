import type { ExperimentalStickering } from "../../../twisty";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class StickeringProp extends SimpleTwistyPropSource<ExperimentalStickering> {
  name = "stickering";

  getDefaultValue(): ExperimentalStickering {
    return "full"; // TODO: auto
  }
}
