import type { ExperimentalStickeringMask } from "../../../../../puzzles/cubing-private";
import type { StickeringMask } from "../../../../../puzzles/stickerings/mask";
import { TwistyPropDerived } from "../../TwistyProp";
import type { PuzzleID } from "../structure/PuzzleIDRequestProp";
import type { ExperimentalStickering } from "./StickeringRequestProp";

interface StickeringMaskPropInputs {
  stickeringRequest: ExperimentalStickering | null
  stickeringMaskRequest: StickeringMask | null
  puzzleID: PuzzleID
}

export class StickeringMaskProp extends TwistyPropDerived<
StickeringMaskPropInputs,
StickeringMask
> {
  getDefaultValue(): ExperimentalStickeringMask {
    return { orbits: {} }; // TODO: auto
  }

  derive(inputs: StickeringMaskPropInputs): StickeringMask {
    throw new Error();
  }
}
