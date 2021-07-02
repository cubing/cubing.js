import { Vector3 } from "three";
import type { Alg } from "../../alg";
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
export const megaminxCameraPosition = centeredCameraPosition
  .clone()
  .multiplyScalar(1.15);
export const cubeCameraPosition = new Vector3(3, 4, 5).multiplyScalar(0.8);
export const cornerCameraPosition = new Vector3(4, 4, 4);
export const pyraminxCameraPosition = new Vector3(0, 2.5, 5); // TODO: center puzzle in frame, use x=0 but increase y

// TODO: turn these maps into lists?
export const setupToLocations = {
  start: true, // default // TODO: "beginning"
  end: true,
};
export type SetupToLocation = keyof typeof setupToLocations;

// TODO: turn these maps into lists?
export const visualizationFormats = {
  "3D": true, // default
  "2D": true,
  "experimental-2D-LL": true, // TODO
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
  "COLL": true,
  "OCLL": true,
  "CLL": true,
  "ELL": true,
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
  "invisible": true,
  "picture": true,
  "experimental-centers-U": true,
  "experimental-centers-U-D": true,
  "experimental-centers-U-L-D": true,
  "experimental-centers-U-L-B-D": true,
  "experimental-centers": true,
  "experimental-fto-fc": true,
  "experimental-fto-f2t": true,
  "experimental-fto-sc": true,
  "experimental-fto-l2c": true,
  "experimental-fto-lbt": true,
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
  "5x5x5": true,
  "6x6x6": true,
  "7x7x7": true,
  "40x40x40": true,
  "megaminx": true,
  "pyraminx": true,
  "square1": true,
  "clock": true,
  "skewb": true,
  "fto": true,
  "gigaminx": true,
};
export type PuzzleID = keyof typeof puzzleIDs;

export const viewerLinkPages = {
  twizzle: true, // default
  none: true,
};
export type ViewerLinkPage = keyof typeof viewerLinkPages;

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
  "experimental-setup-alg": AlgAttribute;
  "experimental-setup-anchor": StringEnumAttribute<SetupToLocation>;

  // Puzzle
  "puzzle": StringEnumAttribute<PuzzleID>;
  "visualization": StringEnumAttribute<VisualizationFormat>;
  "hint-facelets": StringEnumAttribute<HintFaceletStyle>;
  "experimental-stickering": StringEnumAttribute<ExperimentalStickering>;

  // Background
  "background": StringEnumAttribute<BackgroundTheme>;
  "control-panel": StringEnumAttribute<ControlsLocation>;

  // 3D config
  "back-view": StringEnumAttribute<BackViewLayout>;
  "experimental-camera-position": Vector3Attribute;

  // Interaction
  "viewer-link": StringEnumAttribute<ViewerLinkPage>;
}

export interface TwistyPlayerConfigValues {
  alg: Alg | string;
  experimentalSetupAlg: Alg | string;
  experimentalSetupAnchor: SetupToLocation;

  puzzle: PuzzleID;
  visualization: VisualizationFormat;
  hintFacelets: HintFaceletStyle;
  experimentalStickering: ExperimentalStickering;

  background: BackgroundTheme;
  controlPanel: ControlsLocation;

  backView: BackViewLayout;
  experimentalCameraPosition: Vector3;

  viewerLink: ViewerLinkPage;
}

export type TwistyPlayerInitialConfig = Partial<TwistyPlayerConfigValues>;

const twistyPlayerAttributeMap: Record<
  keyof TwistyPlayerAttributes,
  keyof TwistyPlayerConfigValues
> = {
  "alg": "alg",
  "experimental-setup-alg": "experimentalSetupAlg",
  "experimental-setup-anchor": "experimentalSetupAnchor",

  "puzzle": "puzzle",
  "visualization": "visualization",
  "hint-facelets": "hintFacelets",
  "experimental-stickering": "experimentalStickering",

  "background": "background",
  "control-panel": "controlPanel",

  "back-view": "backView",
  "experimental-camera-position": "experimentalCameraPosition",

  "viewer-link": "viewerLink",
};

// TODO: Can we avoid instantiating a new class for each attribute, and would it help performance?
export class TwistyPlayerConfig {
  attributes: TwistyPlayerAttributes;
  constructor(
    private twistyPlayer: TwistyPlayer, // TODO
    initialValues: TwistyPlayerInitialConfig,
  ) {
    this.attributes = {
      "alg": new AlgAttribute(initialValues.alg),
      "experimental-setup-alg": new AlgAttribute(
        initialValues.experimentalSetupAlg,
      ),
      "experimental-setup-anchor": new StringEnumAttribute(
        setupToLocations,
        initialValues.experimentalSetupAnchor,
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
      "control-panel": new StringEnumAttribute(
        controlsLocations,
        initialValues.controlPanel,
      ),
      "back-view": new StringEnumAttribute(
        backViewLayouts,
        initialValues["backView"],
      ),
      "experimental-camera-position": new Vector3Attribute(
        null,
        initialValues["experimentalCameraPosition"],
      ),
      "viewer-link": new StringEnumAttribute(
        viewerLinkPages,
        initialValues.viewerLink,
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
