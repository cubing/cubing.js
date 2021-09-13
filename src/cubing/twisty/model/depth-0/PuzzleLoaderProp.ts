import type { PuzzleDescriptionString } from "../../../puzzle-geometry/PGPuzzles";
import { cube3x3x3, PuzzleLoader, puzzles } from "../../../puzzles";
import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { TwistyPropDerived } from "../TwistyProp";
import { descGenericPGPuzzleLoader } from "./PuzzleLoader-helper";

interface PuzzleLoaderPropInputs {
  puzzleIDRequest: PuzzleID | null;
  puzzleDescriptionRequest: PuzzleDescriptionString | null;
}

export class PuzzleLoaderProp extends TwistyPropDerived<
  PuzzleLoaderPropInputs,
  PuzzleLoader
> {
  derive(inputs: PuzzleLoaderPropInputs): PuzzleLoader {
    if (inputs.puzzleIDRequest) {
      return puzzles[inputs.puzzleIDRequest];
    }
    if (inputs.puzzleDescriptionRequest) {
      return descGenericPGPuzzleLoader(inputs.puzzleDescriptionRequest);
    }
    return cube3x3x3;
  }
}
