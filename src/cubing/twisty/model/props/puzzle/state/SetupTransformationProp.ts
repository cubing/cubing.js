import type { KTransformation } from "../../../../../kpuzzle";
import { SimpleTwistyPropSource } from "../../TwistyProp";

export class SetupTransformationProp extends SimpleTwistyPropSource<KTransformation | null> {
  getDefaultValue(): KTransformation | null {
    return null;
  }
}
