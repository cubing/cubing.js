import type { PuzzleLoader } from "../../../puzzles";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { TwistyPropDerived } from "../TwistyProp";

export class PuzzleIDProp extends TwistyPropDerived<
  { puzzleLoader: PuzzleLoader },
  PuzzleID
> {
  async derive(inputs: { puzzleLoader: PuzzleLoader }): Promise<PuzzleID> {
    return inputs.puzzleLoader.id as any; // TODO: type
  }
}
