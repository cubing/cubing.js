import type { VisualizationFormat } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export type VisualizationFormatWithAuto = VisualizationFormat | "auto";

export class VisualizationFormatProp extends SimpleTwistyPropSource<VisualizationFormatWithAuto> {
  name = "visualization format";
  getDefaultValue(): VisualizationFormatWithAuto {
    return "auto";
  }
}
