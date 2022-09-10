import { SimpleTwistyPropSource } from "../TwistyProp";

export const controlsLocations = {
  "bottom-row": true, // default
  none: true,
};
export type ControlsLocation = keyof typeof controlsLocations;
export type ControlPanelThemeWithAuto = ControlsLocation | "auto";

export class ControlPanelProp extends SimpleTwistyPropSource<ControlPanelThemeWithAuto> {
  getDefaultValue(): ControlPanelThemeWithAuto {
    return "auto";
  }
}
