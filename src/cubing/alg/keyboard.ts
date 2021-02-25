import { Turn } from "./units/leaves/Turn";

const cubeKeyMapping: { [key: number]: Turn } = {
  73: new Turn("R"),
  75: new Turn("R'"),
  87: new Turn("B"),
  79: new Turn("B'"),
  83: new Turn("D"),
  76: new Turn("D'"),
  68: new Turn("L"),
  69: new Turn("L'"),
  74: new Turn("U"),
  70: new Turn("U'"),
  72: new Turn("F"),
  71: new Turn("F'"),

  78: new Turn("x'"),
  67: new Turn("l"),
  82: new Turn("l'"),
  85: new Turn("r"),
  77: new Turn("r'"),

  88: new Turn("d"),
  188: new Turn("d'"),

  84: new Turn("x"),
  89: new Turn("x"),
  66: new Turn("x'"),
  186: new Turn("y"),
  59: new Turn("y"),
  65: new Turn("y'"), // 186 is WebKit, 59 is Mozilla; see http://unixpapa.com/js/key.html
  80: new Turn("z"),
  81: new Turn("z'"),

  90: new Turn("M'"),
  190: new Turn("M'"),
};

// TODO: options about whether to ignore modifier keys (e.g. alt, ctrl).
// TODO: Support different mappings.
// TODO: Return BaseMove instead?
export function keyToMove(e: KeyboardEvent): Turn | null {
  if (e.altKey || e.ctrlKey) {
    return null;
  }

  return cubeKeyMapping[e.keyCode] || null;
}
