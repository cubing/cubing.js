import { BareBlockMove, BlockMove } from "./algorithm";

const cubeKeyMapping: { [key: number]: BlockMove } = {
  73: BareBlockMove("R"), 75: BareBlockMove("R", -1),
  87: BareBlockMove("B"), 79: BareBlockMove("B", -1),
  83: BareBlockMove("D"), 76: BareBlockMove("D", -1),
  68: BareBlockMove("L"), 69: BareBlockMove("L", -1),
  74: BareBlockMove("U"), 70: BareBlockMove("U", -1),
  72: BareBlockMove("F"), 71: BareBlockMove("F", -1), // Heise
  78: BareBlockMove("F"), 86: BareBlockMove("F", -1), // Kirjava

  67: BareBlockMove("l"), 82: BareBlockMove("l", -1),
  85: BareBlockMove("r"), 77: BareBlockMove("r", -1),

  84: BareBlockMove("x"), 89: BareBlockMove("x"), 66: BareBlockMove("x", -1), // 84 (T) and 89 (Y) are alternatives.
  186: BareBlockMove("y"), 59: BareBlockMove("y"), 65: BareBlockMove("y", -1), // 186 is WebKit, 59 is Mozilla; see http://unixpapa.com/js/key.html
  80: BareBlockMove("z"), 81: BareBlockMove("z", -1),

  190: BareBlockMove("M", -1),
};

// TODO: options about whether to ignore modifier keys (e.g. alt, ctrl).
// TODO: Support different mappings.
// TODO: Return BaseMove instead?
export function keyToMove(e: KeyboardEvent): BlockMove | null {
  if (e.altKey || e.ctrlKey) {
    return null;
  }

  return cubeKeyMapping[e.keyCode] || null;
}
