import type { ControlsLocation } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type ControlPanelThemeWithAuto = ControlsLocation | "auto";

export class ControlPanelProp extends SimpleTwistyPropSource<ControlPanelThemeWithAuto> {
  name = "control panel";

  getDefaultValue(): ControlPanelThemeWithAuto {
    return "auto";
  }
}
