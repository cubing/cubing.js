import type { ExperimentalStickeringMask } from "../../../../../puzzles/cubing-private";
import { TwistyPropSource } from "../../TwistyProp";
import { parseSerializedStickeringMask } from "./parseSerializedStickeringMask";

export class StickeringMaskRequestProp extends TwistyPropSource<
  ExperimentalStickeringMask | null,
  string | ExperimentalStickeringMask | null
> {
  getDefaultValue(): ExperimentalStickeringMask | null {
    return null; // TODO: auto
  }

  derive(
    input: string | ExperimentalStickeringMask | null,
  ): ExperimentalStickeringMask | null {
    if (input === null) {
      return null;
    } else if (typeof input === "string") {
      return parseSerializedStickeringMask(input);
    } else {
      return input;
    }
  }
}
