import type { HintFaceletStyle } from "../../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type HintFaceletStyleWithAuto = HintFaceletStyle | "auto";

export class HintFaceletProp extends SimpleTwistyPropSource<HintFaceletStyleWithAuto> {
  getDefaultValue(): HintFaceletStyleWithAuto {
    return "auto";
  }
}
