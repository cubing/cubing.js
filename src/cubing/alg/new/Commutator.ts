import { Alg } from "./Alg";
import { AlgCommon, Comparable, reverse } from "./common";
import { Repetition, RepetitionInfo } from "./Repetition";
import { LeafUnit } from "./Unit";

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

  // TODO: use a common composite iterator helper.
  *experimentalLeafUnits(): Generator<LeafUnit> {
    for (const leafUnit of this.A.units()) {
      yield leafUnit;
    }
    for (const leafUnit of this.B.units()) {
      yield leafUnit;
    }
    for (const leafUnit of reverse(this.A.units())) {
      yield leafUnit;
    }
    for (const leafUnit of reverse(this.B.units())) {
      yield leafUnit;
    }
  }
}

export class Commutator extends AlgCommon<Commutator> {
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

  inverse(): Commutator {
    return new Commutator(
      this.#repetition.quantum.B,
      this.#repetition.quantum.A,
      this.#repetition.info(),
    );
  }

  *experimentalLeafUnits(): Generator<LeafUnit> {
    yield* this.#repetition.experimentalLeafUnits();
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
