import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import type { LeafUnit } from "../Unit";

export class Pause extends AlgCommon<Pause> {
  toString(): string {
    return `.`;
  }

  isIdentical(other: Comparable): boolean {
    return other.is(Pause);
  }

  invert(): Pause {
    return this;
  }

  *experimentalExpand(
    _iterDir: IterationDirection = IterationDirection.Forwards,
    _depth: number = Infinity,
  ): Generator<LeafUnit> {
    yield this;
  }
}
