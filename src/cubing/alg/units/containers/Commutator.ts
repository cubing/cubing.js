import { Alg, experimentalEnsureAlg, FlexibleAlgSource } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { QuantumWithAmount } from "../QuantumWithAmount";
import type { LeafUnit } from "../Unit";

export class QuantumCommutator extends Comparable {
  constructor(public A: Alg, public B: Alg) {
    super();
    Object.freeze(this);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsQuantumCommutator = other.as(QuantumCommutator);
    return !!(
      otherAsQuantumCommutator?.A.isIdentical(this.A) &&
      otherAsQuantumCommutator?.B.isIdentical(this.B)
    );
  }

  toString(): string {
    return `[${this.A}, ${this.B}]`;
  }

  // TODO: use a common composite iterator helper.
  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth: number, // TODO
  ): Generator<LeafUnit> {
    if (depth === 0) {
      throw new Error("cannot expand depth 0 for a quantum");
    }

    if (iterDir === IterationDirection.Forwards) {
      yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.B.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
      yield* this.B.experimentalExpand(IterationDirection.Backwards, depth - 1);
    } else {
      yield* this.B.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.B.experimentalExpand(IterationDirection.Backwards, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
    }
  }
}

export class Commutator extends AlgCommon<Commutator> {
  readonly #quantumWithAmount: QuantumWithAmount<QuantumCommutator>;

  constructor(
    aSource: FlexibleAlgSource,
    bSource: FlexibleAlgSource,
    amount?: number,
  ) {
    super();
    this.#quantumWithAmount = new QuantumWithAmount<QuantumCommutator>(
      new QuantumCommutator(
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
    const otherAsCommutator = other.as(Commutator);
    return (
      !!otherAsCommutator &&
      this.#quantumWithAmount.isIdentical(otherAsCommutator.#quantumWithAmount)
    );
  }

  invert(): Commutator {
    return new Commutator(
      this.#quantumWithAmount.quantum.B,
      this.#quantumWithAmount.quantum.A,
      -this.amount,
    );
  }

  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
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

  // toJSON(): CommutatorJSON {
  //   return {
  //     type: "commutator",
  //     A: this.#quanta.quantum.A.toJSON(),
  //     B: this.#quanta.quantum.B.toJSON(),
  //     amount: this.a
  //   };
  // }
}
