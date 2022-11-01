import { SimpleTwistyPropSource } from "../../TwistyProp";

export type InitialHintFaceletsAnimation = "auto" | "always" | "none";

export class InitialHintFaceletsAnimationProp extends SimpleTwistyPropSource<InitialHintFaceletsAnimation> {
  getDefaultValue(): InitialHintFaceletsAnimation {
    return "auto";
  }
}
