import { SimpleTwistyPropSource } from "../../TwistyProp";

// TODO: turn these maps into lists?
export const hintFaceletStyles = {
  floating: true, // default
  none: true,
};
export type HintFaceletStyle = keyof typeof hintFaceletStyles;
export type HintFaceletStyleWithAuto = HintFaceletStyle | "auto";

export class HintFaceletProp extends SimpleTwistyPropSource<HintFaceletStyleWithAuto> {
  getDefaultValue(): HintFaceletStyleWithAuto {
    return "auto";
  }
}
