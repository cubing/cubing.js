import { BlockMove, Sequence, Unit } from "./algorithm";
import { AlgJSON } from "./json";
import { parseAlg } from "./parser";
import { algToString } from "./traversal";

const warned = new Set<string>();
function warnOnce(s: string): void {
  if (!warned.has(s)) {
    console.warn(s);
    warned.add(s);
  }
}

// TODO: validate
function units(
  inputUnits?: string | Sequence | Iterable<Unit>,
): Iterable<Unit> {
  if (!inputUnits) {
    return [];
  }

  if (typeof inputUnits === "string") {
    return parseAlg(inputUnits).nestedUnits;
  }

  const seq = inputUnits as Sequence;
  if (seq.type === "sequence" && seq.nestedUnits) {
    return seq.nestedUnits;
  }

  const iter = inputUnits as Iterable<Unit>;
  if (typeof iter[Symbol.iterator] === "function") {
    return iter;
  }

  throw "Invalid unit";
}

interface LayerInfo {
  outerLayer?: number;
  innerLayer?: number;
}

export class MoveQuantum {
  readonly #family: string;
  readonly #outerLayer: number | null;
  readonly #innerLayer: number | null;

  constructor(family: string, options?: LayerInfo) {
    this.#family = family;

    this.#outerLayer = options?.outerLayer ?? null;
    const hasOuterLayer = this.#outerLayer !== null;

    this.#innerLayer = options?.innerLayer ?? null;
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

const moveRegex = /((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z])(\d*)?(')?/;

export class Move implements BlockMove {
  readonly #quantum: MoveQuantum;
  readonly #absAmount: number | null;
  readonly #prime: boolean;

  constructor(
    ...args:
      | [MoveQuantum]
      | [MoveQuantum, number | null]
      | [MoveQuantum, number | null, boolean]
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

    const amount: number | null = absAmount ? parseInt(absAmount) : null;

    const layerInfo: LayerInfo = {};
    if (outerLayerStr) {
      layerInfo.outerLayer = parseInt(outerLayerStr);
    }
    if (innerLayerStr) {
      layerInfo.innerLayer = parseInt(innerLayerStr);
    }

    return new Move(
      new MoveQuantum(family, layerInfo),
      amount,
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

export class Alg implements Sequence {
  #units: Iterable<Unit>;
  constructor(alg?: string | Sequence | Iterable<Unit>) {
    this.#units = units(alg);
  }

  static fromString(alg: string): Alg {
    return new Alg(alg);
  }

  /** @deprecated */
  get nestedUnits(): Unit[] {
    warnOnce("deprecated: nestedUnits");
    return Array.from(this.#units);
  }

  *units(): Generator<Unit> {
    for (const unit of this.#units) {
      yield unit;
    }
  }

  /** @deprecated */
  get type(): string {
    warnOnce("deprecated: type");
    return "sequence";
  }

  toJSON(): AlgJSON {
    return new Sequence(this.nestedUnits);
  }

  toString(): string {
    return algToString(new Sequence(this.nestedUnits));
  }
}
