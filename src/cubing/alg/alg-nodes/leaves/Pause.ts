import type { ExperimentalSerializationOptions } from "cubing/alg/SerializationOptions";
import { AlgCommon, type Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import type { AlgLeaf } from "../AlgNode";
import type { Grouping } from "../containers/Grouping";

/** @category Alg Nodes */
export class Pause extends AlgCommon<Pause> {
  experimentalNISSGrouping?: Grouping; // TODO: tie this to the alg

  toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
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
