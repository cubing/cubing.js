import { AlgCommon, Comparable } from "../../common";
import { MAX_INT, MAX_INT_DESCRIPTION } from "../../limits";
import { parseMove, parseQuantumMove } from "../../parse";
import { Repetition, RepetitionInfo } from "../Repetition";
import { LeafUnit } from "../Unit";
import { warnOnce } from "../../warnOnce";
import { IterationDirection } from "../../iteration";

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

  isIdentical(other: Comparable): boolean {
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
  repetition?: RepetitionInfo;
}

export class Move extends AlgCommon<Move> {
  readonly #repetition: Repetition<QuantumMove>;

  constructor(
    ...args:
      | [QuantumMove]
      | [QuantumMove, RepetitionInfo]
      | [string]
      | [string, RepetitionInfo]
  ) {
    super();
    if (typeof args[0] === "string") {
      if (args[1] ?? null) {
        this.#repetition = new Repetition(
          QuantumMove.fromString(args[0]),
          args[1],
        );
        return;
      } else {
        return Move.fromString(args[0]); // TODO: can we return here?
      }
    }
    this.#repetition = new Repetition<QuantumMove>(args[0], args[1]);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsMove = other as Move;
    return (
      other.is(Move) && this.#repetition.isIdentical(otherAsMove.#repetition)
    );
  }

  invert(): Move {
    return new Move(this.#repetition.quantum, this.#repetition.inverseInfo());
  }

  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    if (iterDir === IterationDirection.Forwards) {
      yield this;
    } else {
      yield this.modified({ repetition: this.#repetition.inverseInfo() });
    }
  }

  get quantum(): QuantumMove {
    return this.#repetition.quantum;
  }

  equals(other: Move): boolean {
    return (
      this.quantum.isIdentical(other.quantum) &&
      this.#repetition.isIdentical(other.#repetition)
    );
  }

  modified(modifications: MoveModifications): Move {
    return new Move(
      this.#repetition.quantum.modified(modifications),
      modifications.repetition ?? this.#repetition.info(),
    );
  }

  static fromString(s: string): Move {
    return parseMove(s);
  }

  /** @deprecated */
  get effectiveAmount(): number {
    return (
      (this.#repetition.absAmount ?? 1) * (this.#repetition.prime ? -1 : 1)
    );
  }

  /** @deprecated */
  get type(): string {
    warnOnce("deprecated: type");
    return "blockMove";
  }

  /** @deprecated */
  get family(): string {
    return this.#repetition.quantum.family ?? undefined;
  }

  /** @deprecated */
  get outerLayer(): number | undefined {
    return this.#repetition.quantum.outerLayer ?? undefined;
  }

  /** @deprecated */
  get innerLayer(): number | undefined {
    return this.#repetition.quantum.innerLayer ?? undefined;
  }

  toString(): string {
    return this.#repetition.quantum.toString() + this.#repetition.suffix();
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
