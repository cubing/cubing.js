import { Alg } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection, toggleDirection } from "../../iteration";
import { Repetition, RepetitionInfo } from "../Repetition";
import { LeafUnit } from "../Unit";

export class ConjugateQuantum extends Comparable {
  constructor(public A: Alg, public B: Alg) {
    super();
    Object.freeze(this);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsConjugateQuantum = other as ConjugateQuantum;
    return (
      other.is(ConjugateQuantum) &&
      this.A.isIdentical(otherAsConjugateQuantum.A) &&
      this.B.isIdentical(otherAsConjugateQuantum.B)
    );
  }

  // TODO: use a common composite iterator helper.
  *experimentalLeafUnits(
    iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    yield* this.A.experimentalLeafUnits(IterationDirection.Forwards);
    yield* this.B.experimentalLeafUnits(iterDir);
    yield* this.A.experimentalLeafUnits(toggleDirection(iterDir));
  }

  toString(): string {
    return `[${this.A}: ${this.B}]`;
  }
}

export class Conjugate extends AlgCommon<Conjugate> {
  readonly #repetition: Repetition<ConjugateQuantum>;

  constructor(A: Alg, B: Alg, repetitionInfo?: RepetitionInfo) {
    super();
    this.#repetition = new Repetition<ConjugateQuantum>(
      new ConjugateQuantum(A, B),
      repetitionInfo,
    );
  }

  isIdentical(other: Comparable): boolean {
    const otherAsConjugate = other as Conjugate;
    return (
      other.is(Conjugate) &&
      this.#repetition.isIdentical(otherAsConjugate.#repetition)
    );
  }

  inverse(): Conjugate {
    return new Conjugate(
      this.#repetition.quantum.A,
      this.#repetition.quantum.B.inverse(),
      this.#repetition.info(),
    );
  }

  *experimentalLeafUnits(iterDir: IterationDirection): Generator<LeafUnit> {
    yield* this.#repetition.experimentalLeafUnits(iterDir);
  }

  toString(): string {
    return `${this.#repetition.quantum.toString()}${this.#repetition.suffix()}`;
  }

  // toJSON(): ConjugateJSON {
  //   return {
  //     type: "conjugate",
  //     A: this.#quanta.quantum.A.toJSON(),
  //     B: this.#quanta.quantum.B.toJSON(),
  //     amount: this.a
  //   };
  // }
}
