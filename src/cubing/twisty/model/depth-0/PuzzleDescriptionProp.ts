import type { PuzzleDescriptionString } from "../../../puzzle-geometry/PGPuzzles";
import { SimpleTwistyPropSource } from "../TwistyProp";

export class PGPuzzleDescriptionStringProp extends SimpleTwistyPropSource<PuzzleDescriptionString | null> {
  getDefaultValue(): PuzzleDescriptionString | null {
    return null;
  }
}
