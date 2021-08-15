import { SimpleTwistyPropSource } from "../TwistyProp";
import type { CoordinateDegrees } from "./OrbitCoordinatesRequestProp";

export class LatitudeLimitProp extends SimpleTwistyPropSource<CoordinateDegrees> {
  getDefaultValue(): CoordinateDegrees {
    return 60;
  }
}
