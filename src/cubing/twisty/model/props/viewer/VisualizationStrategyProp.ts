import type { PuzzleID } from "../../../old/dom/TwistyPlayerConfig";
import type { VisualizationFormatWithAuto } from "./VisualizationProp";
import { TwistyPropDerived } from "../TwistyProp";

type VisualizationStrategyPropInputs = {
  visualizationRequest: VisualizationFormatWithAuto;
  puzzleID: PuzzleID;
};

export type VisualizationStrategy =
  | "Cube3D"
  | "2D"
  | "experimental-2D-LL"
  | "PG3D";

export class VisualizationStrategyProp extends TwistyPropDerived<
  VisualizationStrategyPropInputs,
  VisualizationStrategy
> {
  derive(inputs: VisualizationStrategyPropInputs): VisualizationStrategy {
    switch (inputs.puzzleID) {
      case "clock":
      case "square1":
        return "2D";
      case "3x3x3":
        switch (inputs.visualizationRequest) {
          case "auto":
          case "3D":
            return "Cube3D";
          default:
            return inputs.visualizationRequest;
        }
      default:
        switch (inputs.visualizationRequest) {
          case "auto":
          case "3D":
            return "PG3D";
          case "experimental-2D-LL":
            return "2D";
          default:
            return inputs.visualizationRequest;
        }
    }
  }
}
