import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
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

  *experimentalLeafUnits(
    _iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    yield this;
  }
}
