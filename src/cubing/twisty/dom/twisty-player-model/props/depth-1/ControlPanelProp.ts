import type { ControlsLocation } from "../../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type ControlPanelThemeWithAuto = ControlsLocation | "auto";

export class ControlPanelProp extends SimpleTwistyPropSource<ControlPanelThemeWithAuto> {
  getDefaultValue(): ControlPanelThemeWithAuto {
    return "auto";
  }
}
