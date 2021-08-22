import type { BackgroundTheme } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type BackgroundThemeWithAuto = BackgroundTheme | "auto";

export class BackgroundProp extends SimpleTwistyPropSource<BackgroundThemeWithAuto> {
  name = "background";

  getDefaultValue(): BackgroundThemeWithAuto {
    return "auto";
  }
}
