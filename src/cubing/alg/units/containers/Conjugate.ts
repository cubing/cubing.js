import { Alg, FlexibleAlgSource } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
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
  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    yield* this.A.experimentalExpand(IterationDirection.Forwards);
    yield* this.B.experimentalExpand(iterDir);
    yield* this.A.experimentalExpand(IterationDirection.Backwards);
  }

  toString(): string {
    return `[${this.A}: ${this.B}]`;
  }
}

export class Conjugate extends AlgCommon<Conjugate> {
  readonly #repetition: Repetition<ConjugateQuantum>;

  constructor(
    aSource: FlexibleAlgSource,
    bSource: FlexibleAlgSource,
    repetitionInfo?: RepetitionInfo,
  ) {
    super();
    this.#repetition = new Repetition<ConjugateQuantum>(
      new ConjugateQuantum(new Alg(aSource), new Alg(bSource)), // TODO
      repetitionInfo,
    );
  }

  get A(): Alg {
    return this.#repetition.quantum.A;
  }

  get B(): Alg {
    return this.#repetition.quantum.B;
  }

  /** @deprecated */
  get experimentalEffectiveAmount(): number {
    return this.#repetition.experimentalEffectiveAmount();
  }

  /** @deprecated */
  get experimentalRepetitionSuffix(): string {
    return this.#repetition.suffix();
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
      this.#repetition.inverseInfo(),
    );
  }

  *experimentalExpand(
    iterDir: IterationDirection,
    depth: number = Infinity,
  ): Generator<LeafUnit> {
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.inverse();
    } else {
      yield* this.#repetition.experimentalExpand(iterDir, depth);
    }
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
