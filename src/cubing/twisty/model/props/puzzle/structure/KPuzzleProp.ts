import type { KPuzzle } from "../../../../../kpuzzle/index.ts";
import type { PuzzleLoader } from "../../../../../puzzles/index.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";

export class KPuzzleProp extends TwistyPropDerived<
  { puzzleLoader: PuzzleLoader },
  KPuzzle
> {
  async derive(inputs: { puzzleLoader: PuzzleLoader }): Promise<KPuzzle> {
    return inputs.puzzleLoader.kpuzzle();
  }
}
