import type { PuzzleDescriptionString } from "../../../../../puzzle-geometry/PGPuzzles";
import {
  NO_VALUE,
  type NoValueType,
  SimpleTwistyPropSource,
} from "../../TwistyProp";

export class PGPuzzleDescriptionStringProp extends SimpleTwistyPropSource<
  PuzzleDescriptionString | NoValueType
> {
  getDefaultValue(): PuzzleDescriptionString | NoValueType {
    return NO_VALUE;
  }
}
