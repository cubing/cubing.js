import {
  AlgAttribute,
  StringEnumAttribute,
  Vector3Attribute,
} from "./element/ElementConfig";
import { Sequence, parse } from "../../alg";
import { BackViewLayout, backViewLayouts } from "./viewers/TwistyViewerWrapper";
import { Vector3 } from "three";

export type VisualizationFormat = "3D" | "2D" | "PG3D"; // Remove `Twisty3D`
const visualizationFormats: VisualizationFormat[] = ["3D", "2D", "PG3D"];

export type BackgroundTheme = "checkered" | "none";
const backgroundThemes: BackgroundTheme[] = ["checkered", "none"];

export type ControlsLocation = "none" | "bottom-row";
const controlsLocations: ControlsLocation[] = ["bottom-row", "none"];

export type PuzzleID =
  | "3x3x3"
  | "custom"
  | "2x2x2"
  | "4x4x4"
  | "megaminx"
  | "pyraminx"
  | "sq1";
const puzzleIDs = [
  "3x3x3",
  "custom",
  "2x2x2",
  "4x4x4",
  "megaminx",
  "pyraminx",
  "sq1",
];

interface TwistyPlayerAttributes {
  // Alg
  "alg": AlgAttribute;

  // Puzzle
  "puzzle": StringEnumAttribute;
  "visualization": StringEnumAttribute;

  // Background
  "background": StringEnumAttribute;
  "controls": StringEnumAttribute;

  // 3D config
  "back-view": StringEnumAttribute;
  "camera-position": Vector3Attribute;
}

export interface TwistyPlayerConfigInitialValues {
  alg?: Sequence;

  puzzle?: PuzzleID;
  visualization?: VisualizationFormat;

  background?: BackgroundTheme;
  controls?: ControlsLocation;

  backView?: BackViewLayout;
  cameraPosition?: Vector3;
}

// TODO: Can we avoid instantiating a new class for ech attribute, and would it help performance?
export class TwistyPlayerConfig {
  attributes: TwistyPlayerAttributes;
  constructor(initialValues: TwistyPlayerConfigInitialValues) {
    this.attributes = {
      "alg": new AlgAttribute(initialValues.alg),

      "puzzle": new StringEnumAttribute(puzzleIDs, initialValues.puzzle),
      "visualization": new StringEnumAttribute(
        visualizationFormats,
        initialValues.visualization,
      ),

      "background": new StringEnumAttribute(
        backgroundThemes,
        initialValues.background,
      ),
      "controls": new StringEnumAttribute(
        controlsLocations,
        initialValues.controls,
      ),

      "back-view": new StringEnumAttribute(
        backViewLayouts,
        initialValues["backView"],
      ),
      "camera-position": new Vector3Attribute(
        new Vector3(0, 0, 5),
        initialValues["cameraPosition"],
      ),
    };
  }

  processAttributes(elem: HTMLElement): void {
    // TODO: type for `attributeManager`
    for (const [attribute, attributeManager] of Object.entries(
      this.attributes,
    )) {
      const value = elem.getAttribute(attribute);
      if (value === null) {
        // TODO
        continue;
      }
      // TODO: error handling
      attributeManager.setString(value);
    }
  }
}

const config = new TwistyPlayerConfig({
  alg: parse("R U R'"),
  backView: "side-by-side",
});

console.log(config);

(window as any).config = config;
