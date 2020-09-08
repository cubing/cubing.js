import { Vector3 } from "three";
import { Sequence } from "../../alg";
import {
  AlgAttribute,
  StringEnumAttribute,
  Vector3Attribute,
} from "./element/ElementConfig";
import { BackViewLayout, backViewLayouts } from "./viewers/TwistyViewerWrapper";

const DEFAULT_CAMERA_Z = 5;
// Golden ratio is perfect for FTO and Megaminx.
const DEFAULT_CAMERA_Y = DEFAULT_CAMERA_Z * (2 / (1 + Math.sqrt(5)));

// TODO: turn these maps into lists?
export const visualizationFormats = {
  "3D": true, // default
  "2D": true,
  "PG3D": true,
};
export type VisualizationFormat = keyof typeof visualizationFormats;

export const backgroundThemes = {
  checkered: true, // default
  none: true,
};
export type BackgroundTheme = keyof typeof backgroundThemes;

// TODO: turn these maps into lists?
export const hintFaceletStyles = {
  floating: true, // default
  none: true,
};
export type HintFaceletStyle = keyof typeof hintFaceletStyles;

export const controlsLocations = {
  "bottom-row": true, // default
  "none": true,
};
export type ControlsLocation = keyof typeof controlsLocations;

export const puzzleIDs = {
  "3x3x3": true, // default
  "custom": true,
  "2x2x2": true,
  "4x4x4": true,
  "megaminx": true,
  "pyraminx": true,
  "sq1": true,
  "clock": true,
  "skewb": true,
  "FTO": true,
};
export type PuzzleID = keyof typeof puzzleIDs;

// TODO: templatize
export interface ManagedAttribute<K> {
  string: string;
  value: K;
  setString(s: string): boolean;
  setValue(v: K): boolean;
}

type AnyManagedAttribute = ManagedAttribute<any>;

const twistyPlayerAttributeList = [
  "alg",
  "puzzle",
  "visualization",
  "hintFacelets",
  "background",
  "controls",
  "backView",
  "cameraPosition",
];

interface TwistyPlayerAttributes extends Record<string, AnyManagedAttribute> {
  // Alg
  alg: AlgAttribute;

  // Puzzle
  puzzle: StringEnumAttribute<PuzzleID>;
  visualization: StringEnumAttribute<VisualizationFormat>;
  hintFacelets: StringEnumAttribute<HintFaceletStyle>;

  // Background
  background: StringEnumAttribute<BackgroundTheme>;
  controls: StringEnumAttribute<ControlsLocation>;

  // 3D config
  backView: StringEnumAttribute<BackViewLayout>;
  cameraPosition: Vector3Attribute;
}

export interface TwistyPlayerConfigValues {
  alg: Sequence;

  puzzle: PuzzleID;
  visualization: VisualizationFormat;
  hintFacelets: HintFaceletStyle;

  background: BackgroundTheme;
  controls: ControlsLocation;

  backView: BackViewLayout;
  cameraPosition: Vector3;
}

export type TwistyPlayerInitialConfig = Partial<TwistyPlayerConfigValues>;

// TODO: Can we avoid instantiating a new class for ech attribute, and would it help performance?
export class TwistyPlayerConfig {
  attributes: TwistyPlayerAttributes;
  constructor(
    private twistyPlayer: any, // TODO
    initialValues: TwistyPlayerInitialConfig,
  ) {
    this.attributes = {
      alg: new AlgAttribute(initialValues.alg),

      puzzle: new StringEnumAttribute(puzzleIDs, initialValues.puzzle),
      visualization: new StringEnumAttribute(
        visualizationFormats,
        initialValues.visualization,
      ),
      hintFacelets: new StringEnumAttribute(
        hintFaceletStyles,
        initialValues.hintFacelets,
      ),

      background: new StringEnumAttribute(
        backgroundThemes,
        initialValues.background,
      ),
      controls: new StringEnumAttribute(
        controlsLocations,
        initialValues.controls,
      ),
      backView: new StringEnumAttribute(
        backViewLayouts,
        initialValues["backView"],
      ),
      cameraPosition: new Vector3Attribute(
        new Vector3(0, DEFAULT_CAMERA_Y, DEFAULT_CAMERA_Z),
        initialValues["cameraPosition"],
      ),
    };
  }

  static get observedAttributes(): (keyof TwistyPlayerAttributes & string)[] {
    return twistyPlayerAttributeList;
  }

  attributeChangedCallback(
    attributeName: string,
    oldValue: string,
    newValue: string,
  ): void {
    const managedAttribute = this.attributes[attributeName];
    if (managedAttribute) {
      // TODO: Handle `null` better.
      if (oldValue !== null && managedAttribute.string !== oldValue) {
        console.warn(
          "Attribute out of sync!",
          attributeName,
          managedAttribute.string,
          oldValue,
        );
      }
      managedAttribute.setString(newValue);

      // TODO: can we make this type-safe?
      // TODO: avoid double-setting in recursive calls
      this.twistyPlayer[attributeName] = managedAttribute.value;
    }
  }
}
