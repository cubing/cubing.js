import type { PuzzleDescriptionString } from "../../../../../puzzle-geometry/PGPuzzles";
import {
  NoValueType,
  NO_VALUE,
  SimpleTwistyPropSource,
} from "../../TwistyProp";

export class PGPuzzleDescriptionStringProp extends SimpleTwistyPropSource<
  PuzzleDescriptionString | NoValueType
> {
  getDefaultValue(): PuzzleDescriptionString | NoValueType {
    return NO_VALUE;
  }
}
