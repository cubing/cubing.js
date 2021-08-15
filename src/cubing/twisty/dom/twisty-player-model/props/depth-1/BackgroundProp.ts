import type { BackgroundTheme } from "../../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type BackgroundThemeWithAuto = BackgroundTheme | "auto";

export class BackgroundProp extends SimpleTwistyPropSource<BackgroundThemeWithAuto> {
  getDefaultValue(): BackgroundThemeWithAuto {
    return "auto";
  }
}
