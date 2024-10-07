import type { ExperimentalSerializationOptions } from "cubing/alg/SerializationOptions";
import { Commutator, Conjugate } from "..";
import { Alg, experimentalEnsureAlg, type FlexibleAlgSource } from "../../Alg";
import { AlgCommon, type Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import type { AlgLeaf, AlgNode } from "../AlgNode";
import { Move, QuantumMove } from "../leaves/Move";
import type { Pause } from "../leaves/Pause";
import { QuantumWithAmount } from "../QuantumWithAmount";

// This is a workaround for `jest`, which doesn't handle cycles of imports inside `cubing/alg`.
// We need to lazy-initialize the reusable quantum moves for Square-1, so we create this wrapper for it.
class Square1TupleFormatter {
  quantumU_SQ_: QuantumMove | null = null;
  quantumD_SQ_: QuantumMove | null = null;

  format(
    grouping: Grouping,
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string | null {
    if (experimentalSerializationOptions?.notation === "LGN") {
      return null;
    }

    if (grouping.amount !== 1) {
      return null;
    }
    const amounts = this.tuple(grouping);
    if (!amounts) {
      return null;
    }
    return `(${amounts.map((move) => move.amount).join(", ")})`;
  }

  tuple(grouping: Grouping): [moveU: Move, moveD: Move] | null {
    if (grouping.amount !== 1) {
      return null;
    }

    this.quantumU_SQ_ ||= new QuantumMove("U_SQ_");
    this.quantumD_SQ_ ||= new QuantumMove("D_SQ_");

    const quantumAlg = grouping.alg;
    if (quantumAlg.experimentalNumChildAlgNodes() === 2) {
      const [U, D] = quantumAlg.childAlgNodes();
      if (
        U.as(Move)?.quantum.isIdentical(this.quantumU_SQ_) &&
        D.as(Move)?.quantum.isIdentical(this.quantumD_SQ_)
      ) {
        return [U as Move, D as Move]; // TODO: can we reuse the casting from above?
      }
    }
    return null;
  }
}
const square1TupleFormatterInstance = new Square1TupleFormatter();

/** @category Alg Nodes */
export class Grouping extends AlgCommon<Grouping> {
  readonly #quantumWithAmount: QuantumWithAmount<Alg>;
  experimentalNISSPlaceholder?: Pause; // TODO: tie this to the alg

  constructor(algSource: FlexibleAlgSource, amount?: number) {
    super();
    const alg = experimentalEnsureAlg(algSource);
    this.#quantumWithAmount = new QuantumWithAmount(alg, amount);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsGrouping = other as Grouping;
    return (
      other.is(Grouping) &&
      this.#quantumWithAmount.isIdentical(otherAsGrouping.#quantumWithAmount)
    );
  }

  get alg(): Alg {
    return this.#quantumWithAmount.quantum;
  }

  get amount(): number {
    return this.#quantumWithAmount.amount;
  }

  /** @deprecated */
  get experimentalRepetitionSuffix(): string {
    return this.#quantumWithAmount.suffix();
  }

  invert(): Grouping {
    const amounts = square1TupleFormatterInstance.tuple(this);
    if (amounts) {
      const [moveU, moveD] = amounts;
      return new Grouping(new Alg([moveU.invert(), moveD.invert()]));
    }
    return new Grouping(
      this.#quantumWithAmount.quantum,
      -this.#quantumWithAmount.amount,
    );
  }

  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth?: number,
  ): Generator<AlgLeaf> {
    depth ??= Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* this.#quantumWithAmount.experimentalExpand(iterDir, depth - 1);
    }
  }

  static fromString(): Grouping {
    throw new Error("unimplemented");
  }

  #unrepeatedString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string | null {
    const insideString = this.#quantumWithAmount.quantum.toString(
      experimentalSerializationOptions,
    );
    const iter = this.alg.childAlgNodes();
    const { value } = iter.next() as {
      value: AlgNode;
      done: boolean;
    };
    if (iter.next().done && (value?.is(Commutator) || value?.is(Conjugate))) {
      return insideString;
    }
    return `(${insideString})`;
  }

  toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string {
    return (
      square1TupleFormatterInstance.format(
        this,
        experimentalSerializationOptions,
      ) ??
      `${this.#unrepeatedString(experimentalSerializationOptions)}${this.#quantumWithAmount.suffix()}`
    );
  }

  experimentalAsSquare1Tuple(): [moveU: Move, moveD: Move] | null {
    return square1TupleFormatterInstance.tuple(this);
  }
  // toJSON(): GroupingJSON {
  //   return {
  //     type: "grouping",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
}
