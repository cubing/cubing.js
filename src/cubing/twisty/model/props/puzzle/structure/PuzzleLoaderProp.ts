import type { PuzzleDescriptionString } from "../../../../../puzzle-geometry/PGPuzzles";
import { cube3x3x3, type PuzzleLoader, puzzles } from "../../../../../puzzles";
import { experimentalCustomPGPuzzleLoader } from "../../../../../puzzles/cubing-private";
import {
  NO_VALUE,
  type NoValueType,
  TwistyPropDerived,
} from "../../TwistyProp";
import type { PuzzleID } from "./PuzzleIDRequestProp";

8;
interface PuzzleLoaderPropInputs {
  puzzleIDRequest: PuzzleID | NoValueType;
  puzzleDescriptionRequest: PuzzleDescriptionString | NoValueType;
}

export class PuzzleLoaderProp extends TwistyPropDerived<
  PuzzleLoaderPropInputs,
  PuzzleLoader
> {
  derive(inputs: PuzzleLoaderPropInputs): PuzzleLoader {
    if (inputs.puzzleIDRequest && inputs.puzzleIDRequest !== NO_VALUE) {
      const puzzleLoader = puzzles[inputs.puzzleIDRequest];
      if (!puzzleLoader) {
        this.userVisibleErrorTracker!.set({
          errors: [`Invalid puzzle ID: ${inputs.puzzleIDRequest}`],
        });
      }
      return puzzleLoader;
    }
    if (
      inputs.puzzleDescriptionRequest &&
      inputs.puzzleDescriptionRequest !== NO_VALUE
    ) {
      return experimentalCustomPGPuzzleLoader(inputs.puzzleDescriptionRequest);
    }
    return cube3x3x3;
  }
}
