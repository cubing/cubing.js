import type { PuzzleLoader } from "../../../../../puzzles";
import { TwistyPropDerived } from "../../TwistyProp";
import type { PuzzleID } from "./PuzzleIDRequestProp";

export class PuzzleIDProp extends TwistyPropDerived<
  { puzzleLoader: PuzzleLoader },
  PuzzleID
> {
  async derive(inputs: { puzzleLoader: PuzzleLoader }): Promise<PuzzleID> {
    return inputs.puzzleLoader.id as PuzzleID;
  }
}
