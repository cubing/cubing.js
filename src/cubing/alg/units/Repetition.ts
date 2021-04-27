import type { Repeatable } from "../common";
import { IterationDirection, toggleDirection } from "../iteration";
import { MAX_INT, MAX_INT_DESCRIPTION } from "../limits";
import type { LeafUnit } from "./Unit";

export type RepetitionInfo =
  | undefined
  | number
  | null
  | [/* absolute amount */ number | null, /* prime */ boolean];

export class Repetition<Q extends Repeatable> {
  readonly quantum: Q;
  readonly absAmount: number | null = null;
  readonly prime: boolean = false;

  constructor(quantum: Q, repetitionInfo?: RepetitionInfo) {
    this.quantum = quantum;
    if (typeof repetitionInfo === "undefined" || repetitionInfo === null) {
      // nothing
    } else if (typeof repetitionInfo === "number") {
      this.absAmount =
        repetitionInfo === null ? null : Math.abs(repetitionInfo);
      this.prime = repetitionInfo === null ? false : repetitionInfo < 0;
      return;
    } else if (repetitionInfo instanceof Array) {
      this.absAmount = repetitionInfo[0] === null ? null : repetitionInfo[0];
      this.prime = repetitionInfo[1];
    } else {
      throw new Error("invalid repetition");
    }

    if (this.absAmount !== null) {
      if (
        !Number.isInteger(this.absAmount) ||
        this.absAmount! < 0 ||
        this.absAmount > MAX_INT
      ) {
        throw new Error(
          `Unit amount absolute value must be a non-negative integer no larger than ${MAX_INT_DESCRIPTION}.`,
        );
      }
    }

    if (this.prime !== false && this.prime !== true) {
      throw new Error("Invalid prime boolean.");
    }
  }

  /** @deprecated */
  experimentalEffectiveAmount(): number {
    return (this.absAmount ?? 1) * (this.prime ? -1 : 1);
  }

  suffix(): string {
    let s: string = "";
    // TODO
    if (this.absAmount !== null && this.absAmount !== 1) {
      s += this.absAmount;
    }
    if (this.prime) {
      s += "'";
    }
    return s;
  }

  isIdentical(other: Repetition<Q>): boolean {
    return (
      this.quantum.isIdentical(other.quantum) &&
      (this.absAmount ?? 1) === (other.absAmount ?? 1) && // TODO
      this.prime === other.prime
    );
  }

  info(): RepetitionInfo {
    return [this.absAmount, this.prime];
  }

  inverseInfo(): RepetitionInfo {
    return [this.absAmount, !this.prime];
  }

  // TODO: `Conjugate` and `Commutator` decrement `depth` inside the quantum, `Grouping` has to do it outside the quantum.
  *experimentalExpand(
    iterDir: IterationDirection,
    depth: number,
  ): Generator<LeafUnit> {
    const absAmount = this.absAmount ?? 1;
    const newIterDir = toggleDirection(iterDir, this.prime);
    for (let i = 0; i < absAmount; i++) {
      yield* this.quantum.experimentalExpand(newIterDir, depth);
    }
  }
}
