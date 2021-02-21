import { BlockMove, Sequence, Unit } from "./algorithm";
import { AlgJSON } from "./json";
import { parseAlg } from "./parser";
import { algToString } from "./traversal";

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

export class MoveQuantum {
  readonly #family: string;
  readonly #outerLayer: number | null;
  readonly #innerLayer: number | null;

  constructor(
    family: string,
    options?: {
      outerLayer?: number;
      innerLayer?: number;
    },
  ) {
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
    return this.#outerLayer;
  }

  // TODO: provide something more useful on average.
  /** @deprecated */
  get experimentalRawInnerLayer(): number | null {
    return this.#innerLayer;
  }

  toString(): string {
    // Copied from `algToString` traversal.
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

interface Repeatable<_T> {
  readonly amount: number;
}

function repetitionSuffix(amount: number): string {
  const absAmount = Math.abs(amount);
  let s = "";
  if (absAmount !== 1) {
    s += String(absAmount);
  }
  if (absAmount !== amount) {
    s += "'";
  }
  return s;
}

const moveRegex = /((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z])(\d*)?(')?/;

export class Move implements Repeatable<MoveQuantum>, BlockMove {
  readonly #quantum: MoveQuantum;
  readonly #amount: number;

  /** @deprecated */
  readonly _: string; // TODO

  constructor(quantum: MoveQuantum, amount: number = 1) {
    // TODO: validate.
    this.#quantum = quantum;
    this.#amount = amount;

    this._ = this.toString();
  }

  static fromString(s: string): Move {
    const [
      ,
      ,
      ,
      outerLayer,
      innerLayer,
      family,
      absAmount,
      prime,
    ] = moveRegex.exec(s) as string[];

    return new Move(
      new MoveQuantum(family, {
        outerLayer: outerLayer ? parseInt(outerLayer) : undefined,
        innerLayer: innerLayer ? parseInt(innerLayer) : undefined,
      }),
      parseInt(absAmount ?? 1) * (prime === "'" ? -1 : 1),
    );
  }

  get amount(): number {
    return this.#amount;
  }

  /** @deprecated */
  get type(): string {
    return "blockMove";
  }

  /** @deprecated */
  get family(): string {
    return "sequence";
  }

  /** @deprecated */
  get outerLayer(): number | undefined {
    return this.#quantum.experimentalRawOuterLayer ?? undefined;
  }

  /** @deprecated */
  get innerLayer(): number | undefined {
    return this.#quantum.experimentalRawInnerLayer ?? undefined;
  }

  toString(): string {
    return this.#quantum.toString() + repetitionSuffix(this.#amount);
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
    return Array.from(this.#units);
  }

  get units(): Iterable<Unit> {
    return this.#units;
  }

  /** @deprecated */
  get type(): string {
    return "sequence";
  }

  toJSON(): AlgJSON {
    return new Sequence(this.nestedUnits);
  }

  toString(): string {
    return algToString(new Sequence(this.nestedUnits));
  }
}
