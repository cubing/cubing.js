import { SimpleTwistyPropSource } from "../../TwistyProp.ts";

export type InitialHintFaceletsAnimation = "auto" | "always" | "none";

export class InitialHintFaceletsAnimationProp extends SimpleTwistyPropSource<InitialHintFaceletsAnimation> {
  getDefaultValue(): InitialHintFaceletsAnimation {
    return "auto";
  }
}
