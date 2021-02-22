import { AlgCommon, Comparable } from "./common";

export class Newline extends AlgCommon<Newline> {
  toString(): string {
    return `\n`;
  }

  isIdentical(other: Comparable): boolean {
    return other.is(Newline);
  }

  inverse(): Newline {
    return this;
  }
}
