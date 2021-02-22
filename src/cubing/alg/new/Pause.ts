import { AlgCommon, Comparable } from "./common";

export class Pause extends AlgCommon<Pause> {
  toString(): string {
    return `.`;
  }

  isIdentical(other: Comparable): boolean {
    return other.is(Pause);
  }

  inverse(): Pause {
    return this;
  }
}
