import { AlgCommon, type Comparable } from "../../common.ts";
import { IterationDirection } from "../../iteration.ts";
import type { ExperimentalSerializationOptions } from "../../SerializationOptions.ts";
import type { AlgLeaf } from "../AlgNode.ts";
import type { Grouping } from "../containers/Grouping.ts";

/** @category Alg Nodes */
export class Pause extends AlgCommon<Pause> {
  experimentalNISSGrouping?: Grouping; // TODO: tie this to the alg

  toString(
    _experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string {
    return ".";
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
  ): Generator<AlgLeaf> {
    yield this;
  }
}
