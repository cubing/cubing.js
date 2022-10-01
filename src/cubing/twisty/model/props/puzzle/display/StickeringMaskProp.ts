import type { PuzzleAppearance } from "../../../../../puzzles/stickerings/mask";
import { parseSerializedAppearance } from "../../../../../puzzles/stickerings/SerializedAppearance";
import { TwistyPropSource } from "../../TwistyProp";

export class StickeringMaskProp extends TwistyPropSource<
  PuzzleAppearance,
  string | PuzzleAppearance
> {
  getDefaultValue(): PuzzleAppearance {
    return { orbits: {} }; // TODO: auto
  }

  derive(input: string | PuzzleAppearance): PuzzleAppearance {
    if (typeof input === "string") {
      return parseSerializedAppearance(input);
    } else {
      return input;
    }
  }
}
