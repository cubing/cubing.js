import { SimpleTwistyPropSource } from "../TwistyProp";

// TODO: turn these maps into lists?
export const visualizationFormats = {
  "3D": true, // default
  "2D": true,
  "experimental-2D-LL": true, // TODO
  PG3D: true,
};
export type VisualizationFormat = keyof typeof visualizationFormats;
export type VisualizationFormatWithAuto = VisualizationFormat | "auto";

export class VisualizationFormatProp extends SimpleTwistyPropSource<VisualizationFormatWithAuto> {
  getDefaultValue(): VisualizationFormatWithAuto {
    return "auto";
  }
}
