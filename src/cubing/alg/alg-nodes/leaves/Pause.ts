import type { Grouping } from "..";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import type { AlgLeafNode } from "../AlgNode";

/** @category Alg Nodes */
export class Pause extends AlgCommon<Pause> {
  experimentalNISSGrouping?: Grouping; // TODO: tie this to the alg

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
  ): Generator<AlgLeafNode> {
    yield this;
  }
}
