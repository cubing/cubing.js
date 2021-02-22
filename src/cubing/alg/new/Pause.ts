import { AlgCommon, Comparable } from "./common";
import { LeafUnit } from "./Unit";

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

  *experimentalLeafUnits(): Generator<LeafUnit> {
    yield this;
  }
}
