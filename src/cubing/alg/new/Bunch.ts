import { Alg } from "./Alg";
import { AlgCommon, Comparable } from "./common";
import { Repetition, RepetitionInfo } from "./Repetition";

export class Bunch extends AlgCommon {
  readonly #repetition: Repetition<Alg>;

  constructor(alg: Alg, repetitionInfo: RepetitionInfo) {
    super();
    this.#repetition = new Repetition(alg, repetitionInfo);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsBunch = other as Bunch;
    return (
      other.is(Bunch) && this.#repetition.isIdentical(otherAsBunch.#repetition)
    );
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
