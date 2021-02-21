import { AlgCommon, Comparable } from "./common";

export class Pause extends AlgCommon {
  toString(): string {
    return `.`;
  }

  isIdentical(other: Comparable): boolean {
    return other.is(Pause);
  }
}
