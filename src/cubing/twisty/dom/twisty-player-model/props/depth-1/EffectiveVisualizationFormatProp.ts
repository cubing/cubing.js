import type { PuzzleID } from "../../../TwistyPlayerConfig";
import type { VisualizationFormatWithAuto } from "../depth-0/VisualizationProp";
import { TwistyPropDerived } from "../TwistyProp";

export class EffectiveVisualizationFormatProp extends TwistyPropDerived<
  { visualizationRequest: VisualizationFormatWithAuto; puzzleID: PuzzleID },
  "2D" | "3D" | null
> {
  derive(inputs: {
    visualizationRequest: VisualizationFormatWithAuto;
    puzzleID: PuzzleID;
  }): "2D" | "3D" {
    switch (inputs.puzzleID) {
      case "clock":
      case "square1":
        return "2D";
      default:
        if (
          ["2D", "experimental-2D-LL"].includes(inputs.visualizationRequest)
        ) {
          return "2D";
        } else {
          return "3D";
        }
    }
  }
}
