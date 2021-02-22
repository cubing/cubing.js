import { AlgCommon, Comparable } from "../../common";
import { LeafUnit } from "../Unit";

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

  *experimentalLeafUnits(): Generator<LeafUnit> {
    yield this;
  }
}
