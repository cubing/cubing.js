import type { PuzzleDescriptionString } from "../../../../../puzzle-geometry/PGPuzzles";
import {
  cube3x3x3,
  experimentalCustomPGPuzzleLoader,
  PuzzleLoader,
  puzzles,
} from "../../../../../puzzles";
import type { PuzzleID } from "../../../../old/dom/TwistyPlayerConfig";
import { NoValueType, NO_VALUE, TwistyPropDerived } from "../../TwistyProp";
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
