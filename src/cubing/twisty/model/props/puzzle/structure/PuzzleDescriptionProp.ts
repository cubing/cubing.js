import type { PuzzleDescriptionString } from "../../../../../puzzle-geometry/pgPuzzles.ts";
import {
  NO_VALUE,
  type NoValueType,
  SimpleTwistyPropSource,
} from "../../TwistyProp.ts";

export class PGPuzzleDescriptionStringProp extends SimpleTwistyPropSource<
  PuzzleDescriptionString | NoValueType
> {
  getDefaultValue(): PuzzleDescriptionString | NoValueType {
    return NO_VALUE;
  }
}
