import { SimpleTwistyPropSource } from "../../TwistyProp";

export type MovePressInput = "auto" | "none" | "basic";

export class MovePressInputProp extends SimpleTwistyPropSource<MovePressInput> {
  getDefaultValue(): MovePressInput {
    return "auto";
  }
}
