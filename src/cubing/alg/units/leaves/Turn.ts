import { AlgCommon, Comparable } from "../../common";
import { MAX_INT, MAX_INT_DESCRIPTION } from "../../limits";
import { parseTurn, parseQuantumTurn } from "../../parse";
import { Repetition, RepetitionInfo } from "../Repetition";
import { LeafUnit } from "../Unit";
import { warnOnce } from "../../warnOnce";
import { IterationDirection } from "../../iteration";

interface QuantumTurnModifications {
  outerLayer?: number;
  innerLayer?: number;
  family?: string;
}

export class QuantumTurn extends Comparable {
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
        `TurnQuantum inner layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`,
      );
    }

    if (
      this.#outerLayer !== null &&
      (!Number.isInteger(this.#outerLayer) ||
        this.#outerLayer < 1 ||
        this.#outerLayer > MAX_INT)
    ) {
      throw new Error(
        `TurnQuantum outer layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`,
      );
    }

    if (
      this.#outerLayer !== null &&
      this.#innerLayer !== null &&
      this.#innerLayer! <= this.#outerLayer!
    ) {
      throw new Error(
        "TurnQuantum outer layer must be smaller than inner layer.",
      );
    }

    if (this.#outerLayer !== null && this.#innerLayer === null) {
      throw new Error(
        "TurnQuantum with an outer layer must have an inner layer",
      ); // TODO: test
    }
  }

  static fromString(s: string): QuantumTurn {
    return parseQuantumTurn(s);
  }

  modified(modifications: QuantumTurnModifications): QuantumTurn {
    return new QuantumTurn(
      modifications.family ?? this.#family,
      modifications.innerLayer ?? this.#innerLayer,
      modifications.outerLayer ?? this.#outerLayer,
    );
  }

  isIdentical(other: Comparable): boolean {
    const otherAsTurnQuantum = other as QuantumTurn;
    return (
      other.is(QuantumTurn) &&
      this.#family === otherAsTurnQuantum.#family &&
      this.#innerLayer === otherAsTurnQuantum.#innerLayer &&
      this.#outerLayer === otherAsTurnQuantum.#outerLayer
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

  experimentalExpand(): Generator<LeafUnit> {
    throw new Error(
      "experimentalExpand() cannot be called on a `TurnQuantum` directly.",
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

interface TurnModifications {
  outerLayer?: number;
  innerLayer?: number;
  family?: string;
  repetition?: RepetitionInfo;
}

export class Turn extends AlgCommon<Turn> {
  readonly #repetition: Repetition<QuantumTurn>;

  constructor(
    ...args:
      | [QuantumTurn]
      | [QuantumTurn, RepetitionInfo]
      | [string]
      | [string, RepetitionInfo]
  ) {
    super();
    if (typeof args[0] === "string") {
      if (args[1] ?? null) {
        this.#repetition = new Repetition(
          QuantumTurn.fromString(args[0]),
          args[1],
        );
        return;
      } else {
        return Turn.fromString(args[0]); // TODO: can we return here?
      }
    }
    this.#repetition = new Repetition<QuantumTurn>(args[0], args[1]);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsTurn = other as Turn;
    return (
      other.is(Turn) && this.#repetition.isIdentical(otherAsTurn.#repetition)
    );
  }

  inverse(): Turn {
    return new Turn(this.#repetition.quantum, this.#repetition.inverseInfo());
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

  get quantum(): QuantumTurn {
    return this.#repetition.quantum;
  }

  equals(other: Turn): boolean {
    return (
      this.quantum.isIdentical(other.quantum) &&
      this.#repetition.isIdentical(other.#repetition)
    );
  }

  modified(modifications: TurnModifications): Turn {
    return new Turn(
      this.#repetition.quantum.modified(modifications),
      modifications.repetition ?? this.#repetition.info(),
    );
  }

  static fromString(s: string): Turn {
    return parseTurn(s);
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
    return "blockTurn";
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
  // toJSON(): TurnJSON {
  //   return {
  //     type: "turn",
  //     family: this.family,
  //     innerLayer: this.innerLayer,
  //     outerLayer: this.outerLayer,
  //   };
  // }
}
