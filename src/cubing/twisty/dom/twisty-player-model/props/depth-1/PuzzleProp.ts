import type { PuzzleID } from "../../../TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class PuzzleProp extends SimpleTwistyPropSource<PuzzleID> {
  getDefaultValue(): PuzzleID {
    return "3x3x3";
  }
}
