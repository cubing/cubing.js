import { BlockMove } from "../algorithm";
import { MoveQuantum } from "./MoveQuantum";
import { warnOnce } from "./warnOnce";

export const moveRegex = /((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z])(\d*)?(')?/;

export class Move implements BlockMove {
  readonly #quantum: MoveQuantum;
  readonly #absAmount: number | null;
  readonly #prime: boolean;

  constructor(
    ...args:
      | [MoveQuantum]
      | [MoveQuantum, /* amount */ /* amount */ number | null]
      | [
          MoveQuantum,
          /* absolute amount */ /* absolute amount */ number | null,
          /* prime */ boolean,
        ]
      | [string]
  ) {
    if (typeof args[0] === "string") {
      return Move.fromString(args[0]); // TODO: can we return here?
    }
    // TODO: validate.
    this.#quantum = args[0];
    if (typeof args[1] !== "undefined") {
      if (typeof args[2] !== "undefined") {
        this.#absAmount = args[1] === null ? null : Math.abs(args[1]);
        this.#prime = args[2];
      } else {
        this.#absAmount = args[1] === null ? null : args[1];
        this.#prime = args[1] === null ? false : args[1] < 0;
      }
    }

    if (this.#absAmount !== null) {
      if (!Number.isInteger(this.#absAmount) || this.#absAmount! < 0) {
        throw new Error(`Invalid absolute amount: ${this.#absAmount}`);
      }
    }

    if (this.#prime !== false && this.#prime !== true) {
      throw new Error("Invalid prime boolean.");
    }
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
    return (this.#absAmount ?? 1) * (this.#prime ? -1 : 1);
  }

  /** @deprecated */
  get type(): string {
    warnOnce("deprecated: type");
    return "blockMove";
  }

  /** @deprecated */
  get family(): string {
    warnOnce("deprecated: family");
    return "sequence";
  }

  /** @deprecated */
  get outerLayer(): number | undefined {
    warnOnce("deprecated: outerLayer");
    return this.#quantum.experimentalRawOuterLayer ?? undefined;
  }

  /** @deprecated */
  get innerLayer(): number | undefined {
    warnOnce("deprecated: innerLayer");
    return this.#quantum.experimentalRawInnerLayer ?? undefined;
  }

  toString(): string {
    let s = this.#quantum.toString();
    if (this.#absAmount !== null) {
      s += this.#absAmount;
    }
    if (this.#prime) {
      s += "'";
    }
    return s;
  }
}
