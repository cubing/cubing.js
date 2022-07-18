import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import type { AlgLeafNode } from "../AlgNode";

/** @category Alg Nodes */
export class Newline extends AlgCommon<Newline> {
  toString(): string {
    return `\n`;
  }

  isIdentical(other: Comparable): boolean {
    return other.is(Newline);
  }

  invert(): Newline {
    return this;
  }

  *experimentalExpand(
    _iterDir: IterationDirection = IterationDirection.Forwards,
    _depth: number = Infinity,
  ): Generator<AlgLeafNode> {
    yield this;
  }
}
