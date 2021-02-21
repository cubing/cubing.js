import { Alg } from "./Alg";
import { RepetitionInfo, Repetition } from "./Repetition";

export class CommutatorQuantum {
  constructor(public A: Alg, public B: Alg) {
    Object.freeze(this);
  }

  toString(): string {
    return `[${this.A}, ${this.B}]`;
  }
}

export class Commutator {
  readonly #repetition: Repetition<CommutatorQuantum>;

  constructor(
    public readonly A: Alg,
    public readonly B: Alg,
    repetitionInfo: RepetitionInfo,
  ) {
    this.#repetition = new Repetition<CommutatorQuantum>(
      new CommutatorQuantum(A, B),
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
