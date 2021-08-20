import type { ControlsLocation } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type ControlPanelThemeWithAuto = ControlsLocation | "auto";

export class ControlPanelProp extends SimpleTwistyPropSource<ControlPanelThemeWithAuto> {
  getDefaultValue(): ControlPanelThemeWithAuto {
    return "auto";
  }
}
