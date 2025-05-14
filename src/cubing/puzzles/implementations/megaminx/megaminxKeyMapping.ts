import { type AlgLeaf, Move, Pause } from "../../../alg";

// See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code

export const megaminxKeyMapping: { [key: number | string]: AlgLeaf } = {
  KeyI: new Move("R"),
  KeyK: new Move("R'"),
  KeyW: new Move("B"),
  KeyO: new Move("B'"),
  KeyS: new Move("FR"),
  KeyL: new Move("FR'"),
  KeyD: new Move("L"),
  KeyE: new Move("L'"),
  KeyJ: new Move("U"),
  KeyF: new Move("U'"),
  KeyH: new Move("F"),
  KeyG: new Move("F'"),

  KeyC: new Move("Lw"),
  KeyR: new Move("Lw'"),
  KeyU: new Move("Rw"),
  KeyM: new Move("Rw'"),

  KeyX: new Move("d"),
  Comma: new Move("d'"),

  KeyT: new Move("Rv"),
  KeyY: new Move("Rv"),
  KeyV: new Move("Rv'"),
  KeyN: new Move("Rv'"),
  Semicolon: new Move("y"),
  KeyA: new Move("y'"),
  KeyP: new Move("z"),
  KeyQ: new Move("z'"),

  KeyZ: new Move("2L'"),
  KeyB: new Move("2R"),
  Period: new Move("2R'"),

  Backquote: new Pause(),
};
