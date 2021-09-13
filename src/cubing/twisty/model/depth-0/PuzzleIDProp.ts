import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class PuzzleIDProp extends SimpleTwistyPropSource<PuzzleID> {
  getDefaultValue(): PuzzleID {
    return "3x3x3";
  }
}
