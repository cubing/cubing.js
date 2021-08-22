import type { ExperimentalStickering } from "../../../twisty";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class StickeringProp extends SimpleTwistyPropSource<ExperimentalStickering> {
  getDefaultValue(): ExperimentalStickering {
    return "full"; // TODO: auto
  }
}
