import { Pause } from "./alg-nodes";
import type { AlgLeaf } from "./alg-nodes/AlgNode";
import { Move } from "./alg-nodes/leaves/Move";

const cubeKeyMapping: { [key: number]: AlgLeaf } = {
  73: new Move("R"),
  75: new Move("R'"),
  87: new Move("B"),
  79: new Move("B'"),
  83: new Move("D"),
  76: new Move("D'"),
  68: new Move("L"),
  69: new Move("L'"),
  74: new Move("U"),
  70: new Move("U'"),
  72: new Move("F"),
  71: new Move("F'"),

  78: new Move("x'"),
  67: new Move("l"),
  82: new Move("l'"),
  85: new Move("r"),
  77: new Move("r'"),

  88: new Move("d"),
  188: new Move("d'"),

  84: new Move("x"),
  89: new Move("x"),
  66: new Move("x'"),
  186: new Move("y"),
  59: new Move("y"),
  65: new Move("y'"), // 186 is WebKit, 59 is Mozilla; see http://unixpapa.com/js/key.html
  80: new Move("z"),
  81: new Move("z'"),

  90: new Move("M'"),
  190: new Move("M'"),

  192: new Pause(),
};

// TODO: options about whether to ignore modifier keys (e.g. alt, ctrl).
// TODO: Support different mappings.
// TODO: Return BaseMove instead?
export function keyToMove(e: KeyboardEvent): AlgLeaf | null {
  if (e.altKey || e.ctrlKey) {
    return null;
  }

  return cubeKeyMapping[e.keyCode] || null;
}
