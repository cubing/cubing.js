import type { StickeringMask } from "../../../../../puzzles/stickerings/mask";
import { parseSerializedStickeringMask } from "../../../../../puzzles/stickerings/parseSerializedStickeringMask";
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
      return parseSerializedStickeringMask(input);
    } else {
      return input;
    }
  }
}
