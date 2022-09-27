import type { PuzzleAppearance } from "../../../../../puzzles/stickerings/appearance";
import { SimpleTwistyPropSource } from "../../TwistyProp";

export class PuzzleAppearanceProp extends SimpleTwistyPropSource<PuzzleAppearance> {
  getDefaultValue(): PuzzleAppearance {
    return { orbits: {} }; // TODO: auto
  }
}
