import { BlockMove } from "../algorithm";
import { Quanta, QuantaArgs } from "./Quanta";
import { MoveJSON, Serializable } from "./Serializable";
import { warnOnce } from "./warnOnce";

export class MoveQuantum {
  readonly #family: string;
  readonly #outerLayer: number | null;
  readonly #innerLayer: number | null;

  constructor(family: string, innerLayer?: number, outerLayer?: number) {
    this.#family = family;

    this.#outerLayer = outerLayer ?? null;
    const hasOuterLayer = this.#outerLayer !== null;

    this.#innerLayer = innerLayer ?? null;
    const hasInnerLayer = this.#innerLayer !== null;

    if (
      hasInnerLayer &&
      (!Number.isInteger(this.#outerLayer) || this.#outerLayer! < 1)
    ) {
      throw new Error("MoveQuantum inner layer must be a positive integer.");
    }

    if (
      hasInnerLayer &&
      (!Number.isInteger(this.#innerLayer) || this.#innerLayer! < 1)
    ) {
      throw new Error("MoveQuantum outer layer must be a positive integer.");
    }

    if (
      hasInnerLayer &&
      hasOuterLayer &&
      this.#innerLayer! >= this.#outerLayer!
    ) {
      throw new Error(
        "MoveQuantum outer layer must be smaller than inner layer.",
      );
    }

    if (hasOuterLayer && !hasInnerLayer) {
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

export const moveRegex = /((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z])(\d*)?(')?/;

export class Move implements BlockMove, Serializable {
  readonly #quanta: Quanta<MoveQuantum>;

  constructor(...args: QuantaArgs<MoveQuantum> | [string]) {
    if (typeof args[0] === "string") {
      return Move.fromString(args[0]); // TODO: can we return here?
    }
    this.#quanta = new Quanta<MoveQuantum>(
      ...(args as QuantaArgs<MoveQuantum>),
    );
  }

  static fromString(s: string): Move {
    const [
      ,
      ,
      ,
      outerLayerStr,
      innerLayerStr,
      family,
      absAmount,
      primeStr,
    ] = moveRegex.exec(s) as string[];

    function parseOrNull(n: string): number | null {
      return n ? parseInt(n) : null;
    }

    return new Move(
      new MoveQuantum(
        family,
        parseOrNull(innerLayerStr) ?? undefined,
        parseOrNull(outerLayerStr) ?? undefined,
      ),
      parseOrNull(absAmount),
      primeStr === "'",
    );
  }

  /** @deprecated */
  get amount(): number {
    return (this.#quanta.absAmount ?? 1) * (this.#quanta.prime ? -1 : 1);
  }

  /** @deprecated */
  get type(): string {
    warnOnce("deprecated: type");
    return "blockMove";
  }

  /** @deprecated */
  get family(): string {
    warnOnce("deprecated: family");
    return this.#quanta.quantum.experimentalRawFamily ?? undefined;
  }

  /** @deprecated */
  get outerLayer(): number | undefined {
    warnOnce("deprecated: outerLayer");
    return this.#quanta.quantum.experimentalRawOuterLayer ?? undefined;
  }

  /** @deprecated */
  get innerLayer(): number | undefined {
    warnOnce("deprecated: innerLayer");
    return this.#quanta.quantum.experimentalRawInnerLayer ?? undefined;
  }

  toString(): string {
    return this.#quanta.quantum.toString() + this.#quanta.amountSuffix();
  }

  // TODO: Serialize as a string?
  toJSON(): MoveJSON {
    return {
      type: "move",
      family: this.family,
      innerLayer: this.innerLayer,
      outerLayer: this.outerLayer,
    };
  }
}
