import { BlockMove } from "../algorithm";
import { Repetition, RepetitionInfo } from "./Repetition";
import { Serializable } from "./Serializable";
import { warnOnce } from "./warnOnce";
import { parseMove } from "./parse";
import { MAX_INT, MAX_INT_DESCRIPTION } from "./limits";

export class MoveQuantum {
  readonly #family: string;
  readonly #innerLayer: number | null;
  readonly #outerLayer: number | null;

  constructor(family: string, innerLayer?: number, outerLayer?: number) {
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

export class Move implements BlockMove, Serializable {
  readonly #repetition: Repetition<MoveQuantum>;

  constructor(
    ...args: [MoveQuantum] | [MoveQuantum, RepetitionInfo] | [string]
  ) {
    if (typeof args[0] === "string") {
      return Move.fromString(args[0]); // TODO: can we return here?
    }
    this.#repetition = new Repetition<MoveQuantum>(args[0], args[1]);
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
