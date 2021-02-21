import { Alg } from "./Alg";
import { Quanta, QuantaArgs } from "./Quanta";

export class Bunch {
  readonly #quanta: Quanta<Alg>;

  constructor(...args: QuantaArgs<Alg>) {
    this.#quanta = new Quanta<Alg>(...args);
  }

  static fromString(): Bunch {
    throw new Error("unimplemented");
  }

  toString(): string {
    return `(${this.#quanta.quantum.toString()})${this.#quanta.amountSuffix()}`;
  }

  // toJSON(): BunchJSON {
  //   return {
  //     type: "bunch",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
}
