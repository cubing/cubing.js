import { type AlgLeaf, Move, Pause } from "../../../alg";

// See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code

export const cube3x3x3KeyMapping: { [key: number | string]: AlgLeaf } = {
  KeyI: new Move("R"),
  KeyK: new Move("R'"),
  KeyW: new Move("B"),
  KeyO: new Move("B'"),
  KeyS: new Move("D"),
  KeyL: new Move("D'"),
  KeyD: new Move("L"),
  KeyE: new Move("L'"),
  KeyJ: new Move("U"),
  KeyF: new Move("U'"),
  KeyH: new Move("F"),
  KeyG: new Move("F'"),

  KeyC: new Move("l"),
  KeyR: new Move("l'"),
  KeyU: new Move("r"),
  KeyM: new Move("r'"),

  KeyX: new Move("d"),
  Comma: new Move("d'"),

  KeyT: new Move("x"),
  KeyY: new Move("x"),
  KeyV: new Move("x'"),
  KeyN: new Move("x'"),
  Semicolon: new Move("y"),
  KeyA: new Move("y'"),
  KeyP: new Move("z"),
  KeyQ: new Move("z'"),

  KeyZ: new Move("M'"),
  KeyB: new Move("M"),
  Period: new Move("M'"),

  Backquote: new Pause(),
};
