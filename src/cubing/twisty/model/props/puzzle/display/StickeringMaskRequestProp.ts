import type { ExperimentalStickeringMask } from "../../../../../puzzles/cubing-private";
import { TwistyPropSource } from "../../TwistyProp";
import { parseSerializedStickeringMask } from "./parseSerializedStickeringMask";

export class StickeringMaskRequestProp extends TwistyPropSource<
  ExperimentalStickeringMask,
  string | ExperimentalStickeringMask
> {
  getDefaultValue(): ExperimentalStickeringMask {
    return { orbits: {} }; // TODO: auto
  }

  derive(
    input: string | ExperimentalStickeringMask,
  ): ExperimentalStickeringMask {
    if (typeof input === "string") {
      return parseSerializedStickeringMask(input);
    } else {
      return input;
    }
  }
}
