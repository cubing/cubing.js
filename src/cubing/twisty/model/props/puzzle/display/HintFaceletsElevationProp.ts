import { SimpleTwistyPropSource } from "../../TwistyProp";

export type HintFaceletsElevationRequest = "auto" | number;

export class HintFaceletsElevationProp extends SimpleTwistyPropSource<
  "auto" | number
> {
  getDefaultValue(): "auto" | number {
    return "auto";
  }
}
