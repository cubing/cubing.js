import { SimpleTwistyPropSource } from "../../TwistyProp";

export const movePressInputNames = {
  auto: true,
  none: true,
  basic: true,
};
export type MovePressInput = keyof typeof movePressInputNames;

export class MovePressInputProp extends SimpleTwistyPropSource<MovePressInput> {
  getDefaultValue(): MovePressInput {
    return "auto";
  }
}
