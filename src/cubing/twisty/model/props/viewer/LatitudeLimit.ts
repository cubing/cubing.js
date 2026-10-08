import { SimpleTwistyPropSource } from "../TwistyProp.ts";
import type { CoordinateDegrees } from "./OrbitCoordinatesRequestProp.ts";

// Similar to https://alg.cubing.net/
const DEFAULT_LATITUDE_LIMIT = 35;

export class LatitudeLimitProp extends SimpleTwistyPropSource<CoordinateDegrees> {
  getDefaultValue(): CoordinateDegrees {
    return DEFAULT_LATITUDE_LIMIT;
  }
}
