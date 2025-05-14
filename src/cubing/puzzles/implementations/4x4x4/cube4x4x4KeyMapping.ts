import { type AlgLeaf, Move } from "../../../alg";
import { cube3x3x3KeyMapping } from "../3x3x3/cube3x3x3KeyMapping";

// See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code

export const cube4x4x4KeyMapping: { [key: number | string]: AlgLeaf } = {
  ...cube3x3x3KeyMapping,
  KeyZ: new Move("m'"),
  KeyB: new Move("m"),
  Period: new Move("m'"),
};
