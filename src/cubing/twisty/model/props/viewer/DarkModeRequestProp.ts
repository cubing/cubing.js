import { SimpleTwistyPropSource } from "../TwistyProp";

export const darkModeThemes = {
  light: true,
  dark: true,
};
export type DarkModeTheme = keyof typeof darkModeThemes;
export type DarkModeThemeWithAuto = DarkModeTheme | "auto";

export class DarkModeRequstProp extends SimpleTwistyPropSource<DarkModeThemeWithAuto> {
  getDefaultValue(): DarkModeThemeWithAuto {
    return "auto";
  }
}
