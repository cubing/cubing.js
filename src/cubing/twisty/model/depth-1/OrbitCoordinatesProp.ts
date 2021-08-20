import {
  CoordinateDegrees,
  orbitCoordinatesEqual,
  OrbitCoordinatesV2,
} from "../depth-0/OrbitCoordinatesRequestProp";
import { TwistyPropDerived } from "../TwistyProp";

interface OrbitCoordinatesPropInputs {
  orbitCoordinatesRequest: OrbitCoordinatesV2;
  latitudeLimit: CoordinateDegrees;
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
    if (
      Math.abs(inputs.orbitCoordinatesRequest.latitude) <= inputs.latitudeLimit
    ) {
      return inputs.orbitCoordinatesRequest;
    } else {
      const { latitude, longitude, distance } = inputs.orbitCoordinatesRequest;
      // TODO: Should we re-normalize the request, so we don't depend on normalization in the input?
      return {
        latitude: inputs.latitudeLimit * Math.sign(latitude),
        longitude,
        distance,
      };
    }
  }
}
