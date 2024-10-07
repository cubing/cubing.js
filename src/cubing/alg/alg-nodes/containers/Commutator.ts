import type { ExperimentalSerializationOptions } from "cubing/alg/SerializationOptions";
import {
  experimentalEnsureAlg,
  type Alg,
  type FlexibleAlgSource,
} from "../../Alg";
import { AlgCommon, type Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import type { AlgLeaf } from "../AlgNode";

/** @category Alg Nodes */
export class Commutator extends AlgCommon<Commutator> {
  readonly #A: Alg;
  readonly #B: Alg;

  constructor(aSource: FlexibleAlgSource, bSource: FlexibleAlgSource) {
    super();
    this.#A = experimentalEnsureAlg(aSource);
    this.#B = experimentalEnsureAlg(bSource);
  }

  get A(): Alg {
    return this.#A;
  }

  get B(): Alg {
    return this.#B;
  }

  isIdentical(other: Comparable): boolean {
    const otherAsCommutator = other.as(Commutator);
    return !!(
      otherAsCommutator?.A.isIdentical(this.A) &&
      otherAsCommutator?.B.isIdentical(this.B)
    );
  }

  invert(): Commutator {
    return new Commutator(this.#B, this.#A);
  }

  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth?: number,
  ): Generator<AlgLeaf> {
    depth ??= Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      if (iterDir === IterationDirection.Forwards) {
        yield* this.A.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1,
        );
        yield* this.B.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1,
        );
        yield* this.A.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1,
        );
        yield* this.B.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1,
        );
      } else {
        yield* this.B.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1,
        );
        yield* this.A.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1,
        );
        yield* this.B.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1,
        );
        yield* this.A.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1,
        );
      }
    }
  }

  toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string {
    return `[${this.#A.toString(experimentalSerializationOptions)}, ${this.#B.toString(experimentalSerializationOptions)}]`;
  }
}
