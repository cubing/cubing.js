import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { LeafUnit } from "../Unit";

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

  *experimentalLeafUnits(
    _iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    yield this;
  }
}
