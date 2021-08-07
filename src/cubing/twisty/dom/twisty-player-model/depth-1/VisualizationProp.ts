import type { VisualizationFormat } from "../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class VisualizationFormatProp extends SimpleTwistyPropSource<VisualizationFormat> {
  getDefaultValue(): VisualizationFormat {
    return "3D";
  }
}
