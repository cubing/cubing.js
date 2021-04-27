import { Alg, experimentalEnsureAlg, FlexibleAlgSource } from "../../Alg";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { Repetition, RepetitionInfo } from "../Repetition";
import type { LeafUnit } from "../Unit";

export class Grouping extends AlgCommon<Grouping> {
  readonly #repetition: Repetition<Alg>;

  constructor(algSource: FlexibleAlgSource, repetitionInfo?: RepetitionInfo) {
    super();
    const alg = experimentalEnsureAlg(algSource);
    this.#repetition = new Repetition(alg, repetitionInfo);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsGrouping = other as Grouping;
    return (
      other.is(Grouping) &&
      this.#repetition.isIdentical(otherAsGrouping.#repetition)
    );
  }

  /** @deprecated */
  get experimentalAlg(): Alg {
    return this.#repetition.quantum;
  }

  /** @deprecated */
  get experimentalEffectiveAmount(): number {
    return this.#repetition.experimentalEffectiveAmount();
  }

  /** @deprecated */
  get experimentalRepetitionSuffix(): string {
    return this.#repetition.suffix();
  }

  invert(): Grouping {
    return new Grouping(
      this.#repetition.quantum,
      this.#repetition.inverseInfo(),
    );
  }

  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth?: number,
  ): Generator<LeafUnit> {
    depth ??= Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* this.#repetition.experimentalExpand(iterDir, depth - 1);
    }
  }

  static fromString(): Grouping {
    throw new Error("unimplemented");
  }

  toString(): string {
    return `(${this.#repetition.quantum.toString()})${this.#repetition.suffix()}`;
  }

  // toJSON(): GroupingJSON {
  //   return {
  //     type: "grouping",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
}
