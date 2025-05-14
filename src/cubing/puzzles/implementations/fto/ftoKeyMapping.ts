import { type AlgLeaf, Move, Pause } from "../../../alg";

export const ftoKeyMapping: { [key: number | string]: AlgLeaf } = {
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

  KeyN: new Move("Rv'"),
  KeyC: new Move("l"),
  KeyR: new Move("l'"),
  KeyU: new Move("r"),
  KeyM: new Move("r'"),

  KeyX: new Move("d"),
  Comma: new Move("d'"),

  KeyT: new Move("Lv'"),
  KeyY: new Move("Rv"),
  KeyV: new Move("Lv"),
  Semicolon: new Move("Uv"),
  KeyA: new Move("Uv'"),
  KeyP: new Move("BR'"),
  KeyQ: new Move("BL"),

  KeyZ: new Move("BL'"),
  KeyB: new Move("T"),
  Period: new Move("BR"),

  Backquote: new Pause(),
};
