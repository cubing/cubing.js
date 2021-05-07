import { Alg, experimentalEnsureAlg, FlexibleAlgSource } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { QuantumWithAmount } from "../QuantumWithAmount";
import type { LeafUnit } from "../Unit";

export class Grouping extends AlgCommon<Grouping> {
  readonly #quantumWithAmount: QuantumWithAmount<Alg>;

  constructor(algSource: FlexibleAlgSource, amount?: number) {
    super();
    const alg = experimentalEnsureAlg(algSource);
    this.#quantumWithAmount = new QuantumWithAmount(alg, amount);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsGrouping = other as Grouping;
    return (
      other.is(Grouping) &&
      this.#quantumWithAmount.isIdentical(otherAsGrouping.#quantumWithAmount)
    );
  }

  /** @deprecated */
  get experimentalAlg(): Alg {
    return this.#quantumWithAmount.quantum;
  }

  get amount(): number {
    return this.#quantumWithAmount.amount;
  }

  /** @deprecated */
  get experimentalRepetitionSuffix(): string {
    return this.#quantumWithAmount.suffix();
  }

  invert(): Grouping {
    return new Grouping(
      this.#quantumWithAmount.quantum,
      -this.#quantumWithAmount.amount,
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
      yield* this.#quantumWithAmount.experimentalExpand(iterDir, depth - 1);
    }
  }

  static fromString(): Grouping {
    throw new Error("unimplemented");
  }

  toString(): string {
    return `(${this.#quantumWithAmount.quantum.toString()})${this.#quantumWithAmount.suffix()}`;
  }

  // toJSON(): GroupingJSON {
  //   return {
  //     type: "grouping",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
}
