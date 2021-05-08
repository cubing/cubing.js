import { Alg, experimentalEnsureAlg, FlexibleAlgSource } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { Move, QuantumMove } from "../leaves/Move";
import { QuantumWithAmount } from "../QuantumWithAmount";
import type { LeafUnit } from "../Unit";

const quantumU_SQ_ = new QuantumMove("U_SQ_");
const quantumD_SQ_ = new QuantumMove("D_SQ_");

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
    const quantum = this.#quantumWithAmount.quantum;
    if (quantum.experimentalNumUnits() === 2) {
      const [U, D] = quantum.units();
      if (
        U.is(Move) &&
        (U as Move).quantum.isIdentical(quantumU_SQ_) &&
        D.is(Move) &&
        (D as Move).quantum.isIdentical(quantumD_SQ_)
      ) {
        return `(${(U as Move).amount}, ${(D as Move).amount})`;
      }
    }

    return `(${this.#quantumWithAmount.quantum.toString()})${this.#quantumWithAmount.suffix()}`;
  }

  // toJSON(): GroupingJSON {
  //   return {
  //     type: "grouping",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
}
