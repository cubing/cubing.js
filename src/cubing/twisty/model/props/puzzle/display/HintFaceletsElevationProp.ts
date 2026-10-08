import { SimpleTwistyPropSource } from "../../TwistyProp.ts";

export type HintFaceletsElevationRequest = "auto" | number;

export class HintFaceletsElevationProp extends SimpleTwistyPropSource<
  "auto" | number
> {
  getDefaultValue(): "auto" | number {
    return "auto";
  }
}
