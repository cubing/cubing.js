import type { PuzzleLoader } from "../../../../../puzzles/index.ts";
import { TwistyPropDerived } from "../../TwistyProp.ts";
import type { PuzzleID } from "./PuzzleIDRequestProp.ts";

export class PuzzleIDProp extends TwistyPropDerived<
  { puzzleLoader: PuzzleLoader },
  PuzzleID
> {
  async derive(inputs: { puzzleLoader: PuzzleLoader }): Promise<PuzzleID> {
    return inputs.puzzleLoader.id as PuzzleID;
  }
}
