import type { ExperimentalStickering } from "../../../..";
import { SimpleTwistyPropSource } from "../../TwistyProp";

export class StickeringProp extends SimpleTwistyPropSource<ExperimentalStickering> {
  getDefaultValue(): ExperimentalStickering {
    return "full"; // TODO: auto
  }
}
