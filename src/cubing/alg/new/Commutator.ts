import { Alg } from "./Alg";
import { AlgCommon, Comparable } from "./common";
import { Repetition, RepetitionInfo } from "./Repetition";

export class CommutatorQuantum extends Comparable {
  constructor(public A: Alg, public B: Alg) {
    super();
    Object.freeze(this);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsCommutatorQuantum = other as CommutatorQuantum;
    return (
      other.is(CommutatorQuantum) &&
      this.A.isIdentical(otherAsCommutatorQuantum.A) &&
      this.B.isIdentical(otherAsCommutatorQuantum.B)
    );
  }

  toString(): string {
    return `[${this.A}, ${this.B}]`;
  }
}

export class Commutator extends AlgCommon {
  readonly #repetition: Repetition<CommutatorQuantum>;

  constructor(
    public readonly A: Alg,
    public readonly B: Alg,
    repetitionInfo: RepetitionInfo,
  ) {
    super();
    this.#repetition = new Repetition<CommutatorQuantum>(
      new CommutatorQuantum(A, B),
      repetitionInfo,
    );
  }

  isIdentical(other: Comparable): boolean {
    const otherAsCommutator = other as Commutator;
    return (
      other.is(Commutator) &&
      this.#repetition.isIdentical(otherAsCommutator.#repetition)
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
