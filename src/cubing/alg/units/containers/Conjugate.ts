import { Alg, experimentalEnsureAlg, FlexibleAlgSource } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { QuantumWithAmount } from "../QuantumWithAmount";
import type { LeafUnit } from "../Unit";

export class QuantumConjugate extends Comparable {
  constructor(public A: Alg, public B: Alg) {
    super();
    Object.freeze(this);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsQuantumCommutator = other.as(QuantumConjugate);
    return !!(
      otherAsQuantumCommutator?.A.isIdentical(this.A) &&
      otherAsQuantumCommutator?.B.isIdentical(this.B)
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
  readonly #quantumWithAmount: QuantumWithAmount<QuantumConjugate>;

  constructor(
    aSource: FlexibleAlgSource,
    bSource: FlexibleAlgSource,
    amount?: number,
  ) {
    super();
    this.#quantumWithAmount = new QuantumWithAmount<QuantumConjugate>(
      new QuantumConjugate(
        experimentalEnsureAlg(aSource),
        experimentalEnsureAlg(bSource),
      ), // TODO
      amount,
    );
  }

  get A(): Alg {
    return this.#quantumWithAmount.quantum.A;
  }

  get B(): Alg {
    return this.#quantumWithAmount.quantum.B;
  }

  get amount(): number {
    return this.#quantumWithAmount.amount;
  }

  /** @deprecated */
  get experimentalRepetitionSuffix(): string {
    return this.#quantumWithAmount.suffix();
  }

  isIdentical(other: Comparable): boolean {
    const otherAsConjugate = other as Conjugate;
    return (
      other.is(Conjugate) &&
      this.#quantumWithAmount.isIdentical(otherAsConjugate.#quantumWithAmount)
    );
  }

  invert(): Conjugate {
    return new Conjugate(
      this.#quantumWithAmount.quantum.A,
      this.#quantumWithAmount.quantum.B.invert(),
      -this.amount,
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
      yield* this.#quantumWithAmount.experimentalExpand(iterDir, depth);
    }
  }

  toString(): string {
    return `${this.#quantumWithAmount.quantum.toString()}${this.#quantumWithAmount.suffix()}`;
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
