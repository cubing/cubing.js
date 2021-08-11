import { TwistyPropSource } from "../TwistyProp";

export interface OrbitCoordinatesV2 {
  latitude: number;
  longitude: number;
  distance: number;
}

// TOOD: Check if freezing affects perf.
const DEFAULT_COORDINATES = Object.freeze({
  latitude: 0,
  longitude: 0,
  distance: 5,
});

// TODO: Built-in latitude locking.
export class OrbitCoordinatesProp extends TwistyPropSource<
  OrbitCoordinatesV2,
  Partial<OrbitCoordinatesV2>
> {
  getDefaultValue(): OrbitCoordinatesV2 {
    return DEFAULT_COORDINATES;
  }

  async derive(
    newCoordinates: Partial<OrbitCoordinatesV2>,
    oldValuePromise: Promise<OrbitCoordinatesV2>,
  ): Promise<OrbitCoordinatesV2> {
    const oldValue = await oldValuePromise;
    const newValue: OrbitCoordinatesV2 = Object.assign({}, oldValue);
    Object.assign(newValue, newCoordinates);
    return newValue;
  }
}
