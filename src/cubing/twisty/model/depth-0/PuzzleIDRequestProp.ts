import type { PuzzleID } from "../../old/dom/TwistyPlayerConfig";
import { NoValueType, NO_VALUE, SimpleTwistyPropSource } from "../TwistyProp";

// TODO: Ideally we'd use `null` to mean "no value", but `null` has a special meaning
// for `TwistyProp` and might mess with caching.
// https://github.com/cubing/cubing.js/blob/63b0a55b83963f68410bb117a2e481052a07e086/src/cubing/twisty/model/TwistyProp.ts#L189-L189
export class PuzzleIDRequestProp extends SimpleTwistyPropSource<
  PuzzleID | NoValueType
> {
  getDefaultValue(): PuzzleID | NoValueType {
    return NO_VALUE;
  }
}
