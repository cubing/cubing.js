import { AlgCommon, Comparable } from "../../common";
import { IterationDirection } from "../../iteration";
import { MAX_INT, MAX_INT_DESCRIPTION } from "../../limits";
import { parseMove, parseQuantumMove, transferCharIndex } from "../../parse";
import { warnOnce } from "../../warnOnce";
import { QuantumWithAmount } from "../QuantumWithAmount";
import type { LeafUnit } from "../Unit";

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
        this.#innerLayer! < 1 ||
        this.#innerLayer! > MAX_INT)
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
      this.#innerLayer! <= this.#outerLayer!
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

  modified(modifications: QuantumMoveModifications): QuantumMove {
    return new QuantumMove(
      modifications.family ?? this.#family,
      modifications.innerLayer ?? this.#innerLayer,
      modifications.outerLayer ?? this.#outerLayer,
    );
  }

  isIdentical(other: QuantumMove): boolean {
    const otherAsQuantumMove = other as QuantumMove;
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

  experimentalExpand(): Generator<LeafUnit> {
    throw new Error(
      "experimentalExpand() cannot be called on a `QuantumMove` directly.",
    );
  }

  toString(): string {
    let s = this.#family;
    if (this.#innerLayer !== null) {
      s = String(this.#innerLayer) + s;
      if (this.#outerLayer !== null) {
        s = String(this.#outerLayer) + "-" + s;
      }
    }
    return s;
  }
}

interface MoveModifications {
  outerLayer?: number;
  innerLayer?: number;
  family?: string;
  amount?: number;
}

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
        return Move.fromString(args[0]); // TODO: can we return here?
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
    // TODO: handle char indices more consistently among units.
    return transferCharIndex(
      this,
      new Move(this.#quantumWithAmount.quantum, -this.amount),
    );
  }

  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
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

  equals(other: Move): boolean {
    return this.#quantumWithAmount.isIdentical(other.#quantumWithAmount);
  }

  modified(modifications: MoveModifications): Move {
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

  toString(): string {
    if (this.family === "_SLASH_") {
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

    return (
      this.#quantumWithAmount.quantum.toString() +
      this.#quantumWithAmount.suffix()
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
