import { SimpleTwistyPropSource } from "../TwistyProp";

export const colorSchemes = {
  light: true,
  dark: true,
};
export type ColorScheme = keyof typeof colorSchemes;
export type ColorSchemeWithAuto = ColorScheme | "auto";

export class ColorSchemeRequestProp extends SimpleTwistyPropSource<ColorSchemeWithAuto> {
  getDefaultValue(): ColorSchemeWithAuto {
    return "auto";
  }
}
