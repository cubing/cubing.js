import {
  NO_VALUE,
  type NoValueType,
  SimpleTwistyPropSource,
} from "../../TwistyProp";

export const puzzleIDs = {
  "3x3x3": true, // default
  custom: true,
  "2x2x2": true,
  "4x4x4": true,
  "5x5x5": true,
  "6x6x6": true,
  "7x7x7": true,
  "40x40x40": true,
  megaminx: true,
  pyraminx: true,
  square1: true,
  clock: true,
  skewb: true,
  fto: true,
  gigaminx: true,
  master_tetraminx: true,
  kilominx: true,
  redi_cube: true,
  baby_fto: true,
  melindas2x2x2x2: true,
  tri_quad: true,
  loopover: true,
};
export type PuzzleID = keyof typeof puzzleIDs;

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
