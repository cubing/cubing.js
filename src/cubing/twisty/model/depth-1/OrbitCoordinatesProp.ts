import {
  defaultCameraOrbitCoordinates,
  PuzzleID,
} from "../../old/dom/TwistyPlayerConfig";
import {
  CoordinateDegrees,
  orbitCoordinatesEqual,
  OrbitCoordinatesRequest,
  OrbitCoordinatesV2,
} from "../depth-0/OrbitCoordinatesRequestProp";
import { TwistyPropDerived } from "../TwistyProp";

interface OrbitCoordinatesPropInputs {
  orbitCoordinatesRequest: OrbitCoordinatesRequest;
  latitudeLimit: CoordinateDegrees;
  puzzleID: PuzzleID;
}

export class OrbitCoordinatesProp extends TwistyPropDerived<
  OrbitCoordinatesPropInputs,
  OrbitCoordinatesV2
> {
  canReuseValue(v1: OrbitCoordinatesV2, v2: OrbitCoordinatesV2) {
    return orbitCoordinatesEqual(v1, v2);
  }

  async derive(
    inputs: OrbitCoordinatesPropInputs,
  ): Promise<OrbitCoordinatesV2> {
    if (inputs.orbitCoordinatesRequest === "auto") {
      return defaultCameraOrbitCoordinates(inputs.puzzleID);
    }

    const req = Object.assign(
      Object.assign(
        {},
        defaultCameraOrbitCoordinates(inputs.puzzleID),
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
