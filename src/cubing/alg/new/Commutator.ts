import { Alg } from "./Alg";
import { Quanta, QuantaArgs } from "./Quanta";

export class CommutatorQuantum {
  A: Alg;
  B: Alg;

  toString(): string {
    return `[${this.A}, ${this.B}]`;
  }
}

export class Bunch {
  readonly #quanta: Quanta<CommutatorQuantum>;

  constructor(...args: QuantaArgs<CommutatorQuantum>) {
    this.#quanta = new Quanta<CommutatorQuantum>(...args);
  }

  static fromString(): Bunch {
    throw new Error("unimplemented");
  }

  toString(): string {
    return `${this.#quanta.quantum.toString()}${this.#quanta.amountSuffix()}`;
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
