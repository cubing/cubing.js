import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class PuzzleIDRequestProp extends SimpleTwistyPropSource<PuzzleID | null> {
  getDefaultValue(): PuzzleID | null {
    return null;
  }
}
