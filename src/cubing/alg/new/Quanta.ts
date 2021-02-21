export type QuantaArgs<Q> =
  | [Q]
  | [Q, /* amount */ number | null]
  | [Q, /* absolute amount */ number | null, /* prime */ boolean];

export class Quanta<Q> {
  readonly quantum: Q;
  readonly absAmount: number | null = null;
  readonly prime: boolean = false;

  constructor(...args: QuantaArgs<Q>) {
    // TODO: validate.
    this.quantum = args[0];
    if (typeof args[1] !== "undefined") {
      if (typeof args[2] !== "undefined") {
        this.absAmount = args[1] === null ? null : args[1];
        this.prime = args[2];
      } else {
        this.absAmount = args[1] === null ? null : Math.abs(args[1]);
        this.prime = args[1] === null ? false : args[1] < 0;
      }
    }

    if (this.absAmount !== null) {
      if (!Number.isInteger(this.absAmount) || this.absAmount! < 0) {
        throw new Error(`Invalid absolute amount: ${this.absAmount}`);
      }
    }

    if (this.prime !== false && this.prime !== true) {
      throw new Error("Invalid prime boolean.");
    }
  }

  amountSuffix(): string {
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
