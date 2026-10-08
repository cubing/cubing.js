import { SimpleTwistyPropSource } from "../TwistyProp.ts";

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
