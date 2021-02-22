import { AlgCommon, Comparable } from "./common";
import { MAX_INT, MAX_INT_DESCRIPTION } from "./limits";
import { parseMove, parseMoveQuantum } from "./parse";
import { Repetition, RepetitionInfo } from "./Repetition";
import { LeafUnit } from "./Unit";
import { warnOnce } from "./warnOnce";

interface MoveQuantumModifications {
  outerLayer?: number;
  innerLayer?: number;
  family?: string;
}

export class MoveQuantum extends Comparable {
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
        `MoveQuantum inner layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`,
      );
    }

    if (
      this.#outerLayer !== null &&
      (!Number.isInteger(this.#outerLayer) ||
        this.#outerLayer < 1 ||
        this.#outerLayer > MAX_INT)
    ) {
      throw new Error(
        `MoveQuantum outer layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`,
      );
    }

    if (
      this.#outerLayer !== null &&
      this.#innerLayer !== null &&
      this.#innerLayer! >= this.#outerLayer!
    ) {
      throw new Error(
        "MoveQuantum outer layer must be smaller than inner layer.",
      );
    }

    if (this.#outerLayer !== null && this.#innerLayer === null) {
      throw new Error(
        "MoveQuantum with an outer layer must have an inner layer",
      ); // TODO: test
    }
  }

  static fromString(s: string): MoveQuantum {
    return parseMoveQuantum(s);
  }

  modified(modifications: MoveQuantumModifications): MoveQuantum {
    return new MoveQuantum(
      modifications.family ?? this.#family,
      modifications.innerLayer ?? this.#innerLayer,
      modifications.outerLayer ?? this.#outerLayer,
    );
  }

  isIdentical(other: Comparable): boolean {
    const otherAsMoveQuantum = other as MoveQuantum;
    return (
      other.is(MoveQuantum) &&
      this.#family === otherAsMoveQuantum.#family &&
      this.#innerLayer === otherAsMoveQuantum.#innerLayer &&
      this.#outerLayer === otherAsMoveQuantum.#outerLayer
    );
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get experimentalRawFamily(): string {
    warnOnce("deprecated: experimentalRawFamily");
    return this.#family;
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get experimentalRawOuterLayer(): number | null {
    warnOnce("deprecated: experimentalRawOuterLayer");
    return this.#outerLayer;
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get experimentalRawInnerLayer(): number | null {
    warnOnce("deprecated: experimentalRawInnerLayer");
    return this.#innerLayer;
  }

  experimentalLeafUnits(): Generator<LeafUnit> {
    throw new Error(
      "experimentalLeafUnits() cannot be called on a `MoveQuantum` directly.",
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
  readonly #repetition: Repetition<MoveQuantum>;

  constructor(
    ...args:
      | [MoveQuantum]
      | [MoveQuantum, RepetitionInfo]
      | [string]
      | [string, RepetitionInfo]
  ) {
    super();
    if (typeof args[0] === "string") {
      if (args[1] ?? null) {
        this.#repetition = new Repetition(
          MoveQuantum.fromString(args[0]),
          args[1],
        );
        return;
      } else {
        return Move.fromString(args[0]); // TODO: can we return here?
      }
    }
    this.#repetition = new Repetition<MoveQuantum>(args[0], args[1]);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsMove = other as Move;
    return (
      other.is(Move) && this.#repetition.isIdentical(otherAsMove.#repetition)
    );
  }

  inverse(): Move {
    return new Move(
      this.#repetition.quantum,
      this.#repetition.inverse().info(),
    );
  }

  *experimentalLeafUnits(): Generator<LeafUnit> {
    yield this;
  }

  get quantum(): MoveQuantum {
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
      modifications.repetition,
    );
  }

  static fromString(s: string): Move {
    return parseMove(s);
  }

  /** @deprecated */
  get amount(): number {
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
    warnOnce("deprecated: family");
    return this.#repetition.quantum.experimentalRawFamily ?? undefined;
  }

  /** @deprecated */
  get outerLayer(): number | undefined {
    warnOnce("deprecated: outerLayer");
    return this.#repetition.quantum.experimentalRawOuterLayer ?? undefined;
  }

  /** @deprecated */
  get innerLayer(): number | undefined {
    warnOnce("deprecated: innerLayer");
    return this.#repetition.quantum.experimentalRawInnerLayer ?? undefined;
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
