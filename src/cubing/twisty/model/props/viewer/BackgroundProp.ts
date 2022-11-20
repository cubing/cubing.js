import { SimpleTwistyPropSource } from "../TwistyProp";

export const backgroundThemes = {
  checkered: true, // default
  "checkered-transparent": true, // default
  none: true,
};
export type BackgroundTheme = keyof typeof backgroundThemes;

export type BackgroundThemeWithAuto = BackgroundTheme | "auto";

export class BackgroundProp extends SimpleTwistyPropSource<BackgroundThemeWithAuto> {
  getDefaultValue(): BackgroundThemeWithAuto {
    return "auto";
  }
}
