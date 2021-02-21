import { AlgCommon, Comparable } from "./common";

export class Newline extends AlgCommon {
  toString(): string {
    return `\n`;
  }

  isIdentical(other: Comparable): boolean {
    return other.is(Newline);
  }
}
