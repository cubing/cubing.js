import { MAX_INT, MAX_INT_DESCRIPTION } from "./limits";

export type RepetitionInfo =
  | undefined
  | number
  | null
  | [/* absolute amount */ number | null, /* prime */ boolean];

export class Repetition<Q> {
  readonly quantum: Q;
  readonly absAmount: number | null = null;
  readonly prime: boolean = false;

  constructor(quantum: Q, repetitionInfo?: RepetitionInfo) {
    this.quantum = quantum;
    if (typeof repetitionInfo === "undefined" || repetitionInfo === null) {
      // nothing
    } else if (typeof repetitionInfo === "number") {
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

  suffix(): string {
    let s: string = "";
    if (this.absAmount !== null) {
      s += this.absAmount;
    }
    if (this.prime) {
      s += "'";
    }
    return s;
  }
}
