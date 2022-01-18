import type { OldKPuzzleDefinition } from "../../../../../kpuzzle";
import type { PuzzleLoader } from "../../../../../puzzles";
import { TwistyPropDerived } from "../../TwistyProp";

export class PuzzleDefProp extends TwistyPropDerived<
  { puzzleLoader: PuzzleLoader },
  OldKPuzzleDefinition
> {
  async derive(inputs: {
    puzzleLoader: PuzzleLoader;
  }): Promise<OldKPuzzleDefinition> {
    return inputs.puzzleLoader.def();
  }
}
