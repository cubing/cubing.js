import type { PuzzleID } from "../../..";
import { TwistyPropDerived } from "../TwistyProp";
import type { VisualizationFormatWithAuto } from "./VisualizationProp";

type VisualizationStrategyPropInputs = {
  visualizationRequest: VisualizationFormatWithAuto;
  puzzleID: PuzzleID;
};

export type VisualizationStrategy =
  | "Cube3D"
  | "2D"
  | "experimental-2D-LL"
  | "experimental-2D-LL-face"
  | "PG3D";

export class VisualizationStrategyProp extends TwistyPropDerived<
  VisualizationStrategyPropInputs,
  VisualizationStrategy
> {
  derive(inputs: VisualizationStrategyPropInputs): VisualizationStrategy {
    // TODO: let the puzzle loader tell us.
    switch (inputs.puzzleID) {
      case "clock":
      case "square1":
      case "redi_cube":
      case "melindas2x2x2x2":
      case "tri_quad":
      case "loopover":
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
          case "experimental-2D-LL-face":
            if (["2x2x2", "4x4x4", "megaminx"].includes(inputs.puzzleID)) {
              // TODO: calculate this based on the `PuzzleLoader`.
              return "experimental-2D-LL";
            } else {
              return "2D";
            }
          default:
            return inputs.visualizationRequest;
        }
    }
  }
}
