import { SimpleTwistyPropSource } from "../../TwistyProp";

export type FoundationDisplay = "auto" | "opaque" | "none";

export class FoundationDisplayProp extends SimpleTwistyPropSource<FoundationDisplay> {
  getDefaultValue(): FoundationDisplay {
    return "auto";
  }
}
