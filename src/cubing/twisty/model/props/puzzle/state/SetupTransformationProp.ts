import type { KTransformation } from "../../../../../kpuzzle/index.ts";
import { SimpleTwistyPropSource } from "../../TwistyProp.ts";

export class SetupTransformationProp extends SimpleTwistyPropSource<KTransformation | null> {
  getDefaultValue(): KTransformation | null {
    return null;
  }
}
