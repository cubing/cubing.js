import { Alg } from "./Alg";
import { Repetition, RepetitionInfo } from "./Repetition";

export class Bunch {
  readonly #repetition: Repetition<Alg>;

  constructor(alg: Alg, repetitionInfo: RepetitionInfo) {
    this.#repetition = new Repetition(alg, repetitionInfo);
  }

  static fromString(): Bunch {
    throw new Error("unimplemented");
  }

  toString(): string {
    return `(${this.#repetition.quantum.toString()})${this.#repetition.suffix()}`;
  }

  // toJSON(): BunchJSON {
  //   return {
  //     type: "bunch",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
}
