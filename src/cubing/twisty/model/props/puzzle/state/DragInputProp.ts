import { SimpleTwistyPropSource } from "../../TwistyProp.ts";

export const dragInputModes = {
  auto: true,
  none: true,
};
export type DragInputMode = keyof typeof dragInputModes;

export class DragInputProp extends SimpleTwistyPropSource<DragInputMode> {
  getDefaultValue(): DragInputMode {
    return "auto";
  }
}
