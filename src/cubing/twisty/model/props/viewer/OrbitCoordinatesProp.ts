import { DEGREES_PER_RADIAN } from "../../../views/3D/TAU";
import type { PuzzleID } from "../puzzle/structure/PuzzleIDRequestProp";
import { TwistyPropDerived } from "../TwistyProp";
import {
  type CoordinateDegrees,
  type OrbitCoordinates,
  type OrbitCoordinatesRequest,
  orbitCoordinatesEqual,
} from "./OrbitCoordinatesRequestProp";
import type { VisualizationStrategy } from "./VisualizationStrategyProp";

interface OrbitCoordinatesPropInputs {
  orbitCoordinatesRequest: OrbitCoordinatesRequest;
  latitudeLimit: CoordinateDegrees;
  puzzleID: PuzzleID;
  strategy: VisualizationStrategy;
}

export class OrbitCoordinatesProp extends TwistyPropDerived<
  OrbitCoordinatesPropInputs,
  OrbitCoordinates
> {
  override canReuseValue(v1: OrbitCoordinates, v2: OrbitCoordinates) {
    return orbitCoordinatesEqual(v1, v2);
  }

  async derive(inputs: OrbitCoordinatesPropInputs): Promise<OrbitCoordinates> {
    if (inputs.orbitCoordinatesRequest === "auto") {
      return defaultCameraOrbitCoordinates(inputs.puzzleID, inputs.strategy);
    }

    const req: OrbitCoordinates = Object.assign(
      Object.assign(
        {},
        defaultCameraOrbitCoordinates(inputs.puzzleID, inputs.strategy),
        inputs.orbitCoordinatesRequest,
      ),
    );

    if (Math.abs(req.latitude) <= inputs.latitudeLimit) {
      return req;
    } else {
      const { latitude, longitude, distance } = req;
      // TODO: Should we re-normalize the request, so we don't depend on normalization in the input?
      return {
        latitude: inputs.latitudeLimit * Math.sign(latitude),
        longitude,
        distance,
      };
    }
  }
}

// const DEFAULT_CAMERA_Z = 5;
// // Golden ratio is perfect for FTO and Megaminx.
// const DEFAULT_CAMERA_Y = DEFAULT_CAMERA_Z * (2 / (1 + Math.sqrt(5)));
export const centeredCameraOrbitCoordinates: OrbitCoordinates = {
  latitude: 31.717474411461005,
  longitude: 0,
  distance: 5.877852522924731,
};

// This is tuned so that the hint facelets for 3x3x3 always fit in the canvas.
export const cubeCube3DCameraOrbitCoordinates: OrbitCoordinates = {
  latitude: 35,
  longitude: 30,
  distance: 6,
};

// This is tuned so that the hint facelets always fit in the canvas.
export const cubePG3DCameraOrbitCoordinates: OrbitCoordinates = {
  latitude: 35,
  longitude: 30,
  distance: 6.25,
};

export const megaminxCameraOrbitCoordinates: OrbitCoordinates = {
  latitude: Math.atan(1 / 2) * DEGREES_PER_RADIAN,
  longitude: 0,
  distance: 6.7,
};

export const pyraminxCameraOrbitCoordinates: OrbitCoordinates = {
  latitude: 26.56505117707799,
  longitude: 0,
  distance: 6,
};

export const cornerCameraOrbitCoordinates: OrbitCoordinates = {
  latitude: 35.264389682754654,
  longitude: 45,
  distance: 6.928203230275509,
};

// TODO
export function defaultCameraOrbitCoordinates(
  puzzleID: PuzzleID,
  strategy: VisualizationStrategy,
): OrbitCoordinates {
  if (puzzleID[1] === "x") {
    if (strategy === "Cube3D") {
      return cubeCube3DCameraOrbitCoordinates;
    } else {
      return cubePG3DCameraOrbitCoordinates;
    }
  } else {
    switch (puzzleID) {
      case "megaminx":
      case "gigaminx":
        return megaminxCameraOrbitCoordinates;
      case "pyraminx":
      case "master_tetraminx":
        return pyraminxCameraOrbitCoordinates;
      case "skewb":
        return cubePG3DCameraOrbitCoordinates;
      default:
        return centeredCameraOrbitCoordinates;
    }
  }
}
// TODO: templatize
export interface ManagedAttribute<K> {
  string: string;
  value: K;
  setString(s: string): boolean;
  setValue(v: K): boolean;
}
