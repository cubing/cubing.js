import type { twizzleEvents } from "cubing/puzzles";
import {
  type NoValueType,
  NO_VALUE,
  SimpleTwistyPropSource,
} from "../../TwistyProp";

export type PuzzleEventID = keyof typeof twizzleEvents;

// TODO: Ideally we'd use `null` to mean "no value", but `null` has a special meaning
// for `TwistyProp` and might mess with caching.
// https://github.com/cubing/cubing.js/blob/63b0a55b83963f68410bb117a2e481052a07e086/src/cubing/twisty/model/TwistyProp.ts#L189-L189
export class PuzzleEventIDRequestProp extends SimpleTwistyPropSource<
  PuzzleEventID | NoValueType
> {
  getDefaultValue(): PuzzleEventID | NoValueType {
    return NO_VALUE;
  }
}
