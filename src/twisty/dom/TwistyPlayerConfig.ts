import { Vector3 } from "three";
import { Sequence } from "../../alg";
import {
  AlgAttribute,
  StringEnumAttribute,
  Vector3Attribute,
} from "./element/ElementConfig";
import type { TwistyPlayer } from "./TwistyPlayer";
import { BackViewLayout, backViewLayouts } from "./viewers/TwistyViewerWrapper";

const DEFAULT_CAMERA_Z = 5;
// Golden ratio is perfect for FTO and Megaminx.
const DEFAULT_CAMERA_Y = DEFAULT_CAMERA_Z * (2 / (1 + Math.sqrt(5)));

export const centeredCameraPosition = new Vector3(
  0,
  DEFAULT_CAMERA_Y,
  DEFAULT_CAMERA_Z,
);

// TODO
export const cubeCameraPosition = new Vector3(3, 4, 5);

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

// TODO: turn these maps into lists?
// TODO: alg.cubing.net parity
export const experimentalStickerings = {
  "full": true, // default
  "centers-only": true, // TODO
  "PLL": true,
  "CLS": true,
  "OLL": true,
  "ELS": true,
  "LL": true,
  "F2L": true,
  "ZBLL": true,
  "ZBLS": true,
  "WVLS": true,
  "VLS": true,
  "LS": true,
  "EO": true,
  "CMLL": true,
  "L6E": true,
  "L6EO": true,
  "Daisy": true,
  "Cross": true,
  "2x2x2": true,
  "2x2x3": true,
  "Void Cube": true,
};
export type ExperimentalStickering = keyof typeof experimentalStickerings;

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

interface TwistyPlayerAttributes extends Record<string, AnyManagedAttribute> {
  // Alg
  "alg": AlgAttribute;
  "experimental-start-setup": AlgAttribute;

  // Puzzle
  "puzzle": StringEnumAttribute<PuzzleID>;
  "visualization": StringEnumAttribute<VisualizationFormat>;
  "hint-facelets": StringEnumAttribute<HintFaceletStyle>;
  "experimental-stickering": StringEnumAttribute<ExperimentalStickering>;

  // Background
  "background": StringEnumAttribute<BackgroundTheme>;
  "controls": StringEnumAttribute<ControlsLocation>;

  // 3D config
  "back-view": StringEnumAttribute<BackViewLayout>;
  "camera-position": Vector3Attribute;
}

export interface TwistyPlayerConfigValues {
  alg: Sequence;
  experimentalStartSetup: Sequence;

  puzzle: PuzzleID;
  visualization: VisualizationFormat;
  hintFacelets: HintFaceletStyle;
  experimentalStickering: ExperimentalStickering;

  background: BackgroundTheme;
  controls: ControlsLocation;

  backView: BackViewLayout;
  cameraPosition: Vector3;
}

export type TwistyPlayerInitialConfig = Partial<TwistyPlayerConfigValues>;

const twistyPlayerAttributeMap: Record<
  keyof TwistyPlayerAttributes,
  keyof TwistyPlayerConfigValues
> = {
  "alg": "alg",
  "experimental-start-setup": "experimentalStartSetup",

  "puzzle": "puzzle",
  "visualization": "visualization",
  "hint-facelets": "hintFacelets",
  "experimental-stickering": "experimentalStickering",

  "background": "background",
  "controls": "controls",

  "back-view": "backView",
  "camera-position": "cameraPosition",
};

// TODO: Can we avoid instantiating a new class for ech attribute, and would it help performance?
export class TwistyPlayerConfig {
  attributes: TwistyPlayerAttributes;
  constructor(
    private twistyPlayer: TwistyPlayer, // TODO
    initialValues: TwistyPlayerInitialConfig,
  ) {
    this.attributes = {
      "alg": new AlgAttribute(initialValues.alg),
      "experimental-start-setup": new AlgAttribute(
        initialValues.experimentalStartSetup,
      ),

      "puzzle": new StringEnumAttribute(puzzleIDs, initialValues.puzzle),
      "visualization": new StringEnumAttribute(
        visualizationFormats,
        initialValues.visualization,
      ),
      "hint-facelets": new StringEnumAttribute(
        hintFaceletStyles,
        initialValues.hintFacelets,
      ),
      "experimental-stickering": new StringEnumAttribute(
        experimentalStickerings,
        initialValues.experimentalStickering,
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
        null,
        initialValues["cameraPosition"],
      ),
    };
  }

  static get observedAttributes(): (keyof TwistyPlayerAttributes & string)[] {
    return Object.keys(twistyPlayerAttributeMap);
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
      const propertyName: keyof TwistyPlayerConfigValues =
        twistyPlayerAttributeMap[attributeName];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.twistyPlayer[propertyName] = managedAttribute.value;
    }
  }
}
