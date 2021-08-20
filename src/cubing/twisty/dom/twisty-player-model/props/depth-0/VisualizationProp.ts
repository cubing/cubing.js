import type { VisualizationFormat } from "../../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type VisualizationFormatWithAuto = VisualizationFormat | "auto";

export class VisualizationFormatProp extends SimpleTwistyPropSource<VisualizationFormatWithAuto> {
  getDefaultValue(): VisualizationFormatWithAuto {
    return "auto";
  }
}
