import { Alg, experimentalEnsureAlg, FlexibleAlgSource } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { Repetition, RepetitionInfo } from "../Repetition";
import type { LeafUnit } from "../Unit";

export class QuantumCommutator extends Comparable {
  constructor(public A: Alg, public B: Alg) {
    super();
    Object.freeze(this);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsQuantumCommutator = other as QuantumCommutator;
    return (
      other.is(QuantumCommutator) &&
      this.A.isIdentical(otherAsQuantumCommutator.A) &&
      this.B.isIdentical(otherAsQuantumCommutator.B)
    );
  }

  // TODO: use a common composite iterator helper.
  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth: number,
  ): Generator<LeafUnit> {
    if (depth === 0) {
      throw new Error("cannot expand depth 0 for a quantum");
    }

    yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
    yield* this.B.experimentalExpand(iterDir, depth - 1);
    yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
  }

  toString(): string {
    return `[${this.A}: ${this.B}]`;
  }
}

export class Conjugate extends AlgCommon<Conjugate> {
  readonly #repetition: Repetition<QuantumCommutator>;

  constructor(
    aSource: FlexibleAlgSource,
    bSource: FlexibleAlgSource,
    repetitionInfo?: RepetitionInfo,
  ) {
    super();
    this.#repetition = new Repetition<QuantumCommutator>(
      new QuantumCommutator(
        experimentalEnsureAlg(aSource),
        experimentalEnsureAlg(bSource),
      ), // TODO
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

  invert(): Conjugate {
    return new Conjugate(
      this.#repetition.quantum.A,
      this.#repetition.quantum.B.invert(),
      this.#repetition.info(),
    );
  }

  *experimentalExpand(
    iterDir: IterationDirection,
    depth?: number,
  ): Generator<LeafUnit> {
    depth ??= Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
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
