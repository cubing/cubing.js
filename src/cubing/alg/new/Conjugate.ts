import { Alg } from "./Alg";
import { Repetition, RepetitionInfo } from "./Repetition";

export class ConjugateQuantum {
  constructor(public A: Alg, public B: Alg) {
    Object.freeze(this);
  }

  toString(): string {
    return `[${this.A}: ${this.B}]`;
  }
}

export class Conjugate {
  readonly #repetition: Repetition<ConjugateQuantum>;

  constructor(A: Alg, B: Alg, repetitionInfo: RepetitionInfo) {
    this.#repetition = new Repetition<ConjugateQuantum>(
      new ConjugateQuantum(A, B),
      repetitionInfo,
    );
  }

  toString(): string {
    return `${this.#repetition.quantum.toString()}${this.#repetition.suffix()}`;
  }

  // toJSON(): CommutatorJSON {
  //   return {
  //     type: "commutator",
  //     A: this.#quanta.quantum.A.toJSON(),
  //     B: this.#quanta.quantum.B.toJSON(),
  //     amount: this.a
  //   };
  // }
}
