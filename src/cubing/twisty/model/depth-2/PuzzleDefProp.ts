import type { KPuzzleDefinition } from "../../../kpuzzle";
import type { PuzzleLoader } from "../../../puzzles";
import { TwistyPropDerived } from "../TwistyProp";

export class PuzzleDefProp extends TwistyPropDerived<
  { puzzleLoader: PuzzleLoader },
  KPuzzleDefinition
> {
  async derive(inputs: {
    puzzleLoader: PuzzleLoader;
  }): Promise<KPuzzleDefinition> {
    return inputs.puzzleLoader.def();
  }
}
