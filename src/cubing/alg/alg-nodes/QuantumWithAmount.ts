import type { Repeatable } from "../common";
import { type IterationDirection, toggleDirection } from "../iteration";
import { MAX_INT, MAX_INT_DESCRIPTION, MIN_INT } from "../limits";
import type { AlgLeaf } from "./AlgNode";

export class QuantumWithAmount<Q extends Repeatable> {
  readonly quantum: Q;
  readonly amount: number;

  constructor(quantum: Q, amount: number = 1) {
    this.quantum = quantum;
    this.amount = amount;

    if (
      !Number.isInteger(this.amount) ||
      this.amount < MIN_INT ||
      this.amount > MAX_INT
    ) {
      throw new Error(
        `AlgNode amount absolute value must be a non-negative integer below ${MAX_INT_DESCRIPTION}.`,
      );
    }
  }

  suffix(): string {
    let s: string = "";
    // TODO
    const absAmount = Math.abs(this.amount);
    if (absAmount !== 1) {
      s += absAmount;
    }
    if (this.amount < 0) {
      s += "'";
    }
    return s;
  }

  isIdentical(other: QuantumWithAmount<Q>): boolean {
    return (
      this.quantum.isIdentical(other.quantum) && this.amount === other.amount
    );
  }

  // TODO: `Conjugate` and `Commutator` decrement `depth` inside the quantum, `Grouping` has to do it outside the quantum.
  *experimentalExpand(
    iterDir: IterationDirection,
    depth: number,
  ): Generator<AlgLeaf> {
    const absAmount = Math.abs(this.amount);
    const newIterDir = toggleDirection(iterDir, this.amount < 0);
    for (let i = 0; i < absAmount; i++) {
      yield* this.quantum.experimentalExpand(newIterDir, depth);
    }
  }
}
