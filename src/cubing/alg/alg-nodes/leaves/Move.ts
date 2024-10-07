import type { ExperimentalSerializationOptions } from "cubing/alg/SerializationOptions";
import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { MAX_INT, MAX_INT_DESCRIPTION } from "../../limits";
import { parseMove, parseQuantumMove, transferCharIndex } from "../../parseAlg";
import { warnOnce } from "../../warnOnce";
import type { AlgLeaf } from "../AlgNode";
import { QuantumWithAmount } from "../QuantumWithAmount";

interface QuantumMoveModifications {
  outerLayer?: number;
  innerLayer?: number;
  family?: string;
}

export class QuantumMove extends Comparable {
  readonly #family: string;
  readonly #innerLayer: number | null;
  readonly #outerLayer: number | null;

  constructor(
    family: string,
    innerLayer?: number | null,
    outerLayer?: number | null,
  ) {
    super();
    this.#family = family;
    this.#innerLayer = innerLayer ?? null;
    this.#outerLayer = outerLayer ?? null;
    Object.freeze(this);

    if (
      this.#innerLayer !== null &&
      (!Number.isInteger(this.#innerLayer) ||
        this.#innerLayer < 1 ||
        this.#innerLayer > MAX_INT)
    ) {
      throw new Error(
        `QuantumMove inner layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`,
      );
    }

    if (
      this.#outerLayer !== null &&
      (!Number.isInteger(this.#outerLayer) ||
        this.#outerLayer < 1 ||
        this.#outerLayer > MAX_INT)
    ) {
      throw new Error(
        `QuantumMove outer layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`,
      );
    }

    if (
      this.#outerLayer !== null &&
      this.#innerLayer !== null &&
      this.#innerLayer <= this.#outerLayer
    ) {
      throw new Error(
        "QuantumMove outer layer must be smaller than inner layer.",
      );
    }

    if (this.#outerLayer !== null && this.#innerLayer === null) {
      throw new Error(
        "QuantumMove with an outer layer must have an inner layer",
      ); // TODO: test
    }
  }

  static fromString(s: string): QuantumMove {
    return parseQuantumMove(s);
  }

  // TODO: `modify`?
  modified(modifications: QuantumMoveModifications): QuantumMove {
    return new QuantumMove(
      modifications.family ?? this.#family,
      modifications.innerLayer ?? this.#innerLayer,
      modifications.outerLayer ?? this.#outerLayer,
    );
  }

  isIdentical(other: QuantumMove): boolean {
    const otherAsQuantumMove = other;
    return (
      other.is(QuantumMove) &&
      this.#family === otherAsQuantumMove.#family &&
      this.#innerLayer === otherAsQuantumMove.#innerLayer &&
      this.#outerLayer === otherAsQuantumMove.#outerLayer
    );
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get family(): string {
    return this.#family;
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get outerLayer(): number | null {
    return this.#outerLayer;
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get innerLayer(): number | null {
    return this.#innerLayer;
  }

  experimentalExpand(): Generator<AlgLeaf> {
    throw new Error(
      "experimentalExpand() cannot be called on a `QuantumMove` directly.",
    );
  }

  override toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string {
    let s = this.#family;
    if (this.#innerLayer !== null) {
      s = String(this.#innerLayer) + s;
      if (this.#outerLayer !== null) {
        s = `${String(this.#outerLayer)}-${s}`;
      }
    }
    return s;
  }
}

export interface MoveModifications {
  outerLayer?: number;
  innerLayer?: number;
  family?: string;
  amount?: number;
}

/** @category Alg Nodes */
export class Move extends AlgCommon<Move> {
  readonly #quantumWithAmount: QuantumWithAmount<QuantumMove>;

  constructor(
    ...args: [QuantumMove] | [QuantumMove, number] | [string] | [string, number]
  ) {
    super();
    if (typeof args[0] === "string") {
      if (args[1] ?? null) {
        this.#quantumWithAmount = new QuantumWithAmount(
          QuantumMove.fromString(args[0]),
          args[1],
        );
        return;
      } else {
        // biome-ignore lint/correctness/noConstructorReturn: https://github.com/rome/tools/issues/4005
        return Move.fromString(args[0]);
      }
    }
    this.#quantumWithAmount = new QuantumWithAmount<QuantumMove>(
      args[0],
      args[1],
    );
  }

  isIdentical(other: Comparable): boolean {
    const otherAsMove = other.as(Move);
    return (
      !!otherAsMove &&
      this.#quantumWithAmount.isIdentical(otherAsMove.#quantumWithAmount)
    );
  }

  invert(): Move {
    // TODO: handle char indices more consistently among alg nodes.
    return transferCharIndex(
      this,
      new Move(
        this.#quantumWithAmount.quantum,
        this.#isSlash() ? this.amount : -this.amount,
      ),
    );
  }

  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<AlgLeaf> {
    if (iterDir === IterationDirection.Forwards) {
      yield this;
    } else {
      yield this.modified({
        amount: -this.amount,
      });
    }
  }

  get quantum(): QuantumMove {
    return this.#quantumWithAmount.quantum;
  }

  // TODO: `modify`?
  modified(modifications: MoveModifications): Move {
    // TODO: Avoid creating a new quantum move
    return new Move(
      this.#quantumWithAmount.quantum.modified(modifications),
      modifications.amount ?? this.amount,
    );
  }

  static fromString(s: string): Move {
    return parseMove(s);
  }

  get amount(): number {
    return this.#quantumWithAmount.amount;
  }

  /** @deprecated */
  get type(): string {
    warnOnce("deprecated: type");
    return "blockMove";
  }

  /** @deprecated */
  get family(): string {
    return this.#quantumWithAmount.quantum.family ?? undefined;
  }

  /** @deprecated */
  get outerLayer(): number | undefined {
    return this.#quantumWithAmount.quantum.outerLayer ?? undefined;
  }

  /** @deprecated */
  get innerLayer(): number | undefined {
    return this.#quantumWithAmount.quantum.innerLayer ?? undefined;
  }

  #cachedSlashMove: Move | undefined;
  #isSlash(): boolean {
    return this.isIdentical((this.#cachedSlashMove ??= new Move("_SLASH_")));
  }

  toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string {
    if (experimentalSerializationOptions?.notation !== "LGN") {
      if (this.#isSlash()) {
        return "/"; // TODO: validate no amount
      }
      if (this.family.endsWith("_PLUS_")) {
        return (
          this.#quantumWithAmount.quantum.toString().slice(0, -6) +
          Math.abs(this.amount) +
          (this.amount < 0 ? "-" : "+")
        ); // TODO
      }
      if (this.family.endsWith("_PLUSPLUS_")) {
        const absAmount = Math.abs(this.amount);
        return (
          this.#quantumWithAmount.quantum.toString().slice(0, -10) +
          (absAmount === 1 ? "" : absAmount) +
          (this.amount < 0 ? "--" : "++")
        ); // TODO
      }
    }
    return (
      this.#quantumWithAmount.quantum.toString(
        experimentalSerializationOptions,
      ) + this.#quantumWithAmount.suffix()
    );
  }
  // // TODO: Serialize as a string?
  // toJSON(): MoveJSON {
  //   return {
  //     type: "move",
  //     family: this.family,
  //     innerLayer: this.innerLayer,
  //     outerLayer: this.outerLayer,
  //   };
  // }
}
