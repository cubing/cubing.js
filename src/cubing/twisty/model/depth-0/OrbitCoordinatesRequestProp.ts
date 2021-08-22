import { mod } from "../helpers";
import { TwistyPropSource } from "../TwistyProp";

export type CoordinateDegrees = number;

export interface OrbitCoordinatesV2 {
  latitude: CoordinateDegrees;
  longitude: CoordinateDegrees;
  distance: number;
}

export function orbitCoordinatesEqual(
  c1: OrbitCoordinatesV2,
  c2: OrbitCoordinatesV2,
): boolean {
  return (
    c1.latitude === c2.latitude &&
    c1.longitude === c2.longitude &&
    c1.distance === c2.distance
  );
}

// TOOD: Check if freezing affects perf.
const DEFAULT_COORDINATES = Object.freeze({
  latitude: 35,
  longitude: 30,
  distance: 6,
});

export type OrbitCoordinatesRequest = OrbitCoordinatesV2 | "auto";

// TODO: Put the "auto" calculations in a separate place.
export class OrbitCoordinatesRequestProp extends TwistyPropSource<
  OrbitCoordinatesRequest,
  Partial<OrbitCoordinatesV2> | "auto"
> {
  getDefaultValue(): OrbitCoordinatesRequest {
    return "auto";
  }

  canReuseValue(v1: OrbitCoordinatesV2, v2: OrbitCoordinatesV2) {
    return v1 === v2 || orbitCoordinatesEqual(v1, v2);
  }

  async derive(
    newCoordinates: Partial<OrbitCoordinatesV2> | "auto",
    oldValuePromise: Promise<OrbitCoordinatesRequest>,
  ): Promise<OrbitCoordinatesRequest> {
    if (newCoordinates === "auto") {
      return "auto";
    }

    let oldValue = await oldValuePromise;
    if (oldValue === "auto") {
      oldValue = DEFAULT_COORDINATES;
    }

    const newValue: OrbitCoordinatesV2 = Object.assign({}, oldValue);
    Object.assign(newValue, newCoordinates);

    newValue.latitude = Math.min(Math.max(newValue.latitude, -90), 90);
    newValue.longitude = mod(newValue.longitude, 360, 180);
    return newValue;
  }
}
