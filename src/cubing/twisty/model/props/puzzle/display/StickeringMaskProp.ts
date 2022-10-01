import type { StickeringMask } from "../../../../../puzzles/stickerings/mask";
import { parseSerializedAppearance } from "../../../../../puzzles/stickerings/SerializedAppearance";
import { TwistyPropSource } from "../../TwistyProp";

export class StickeringMaskProp extends TwistyPropSource<
  StickeringMask,
  string | StickeringMask
> {
  getDefaultValue(): StickeringMask {
    return { orbits: {} }; // TODO: auto
  }

  derive(input: string | StickeringMask): StickeringMask {
    if (typeof input === "string") {
      return parseSerializedAppearance(input);
    } else {
      return input;
    }
  }
}
