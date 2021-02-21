import { Sequence, Unit } from "./algorithm";
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

interface FakeDeprecatedJSON {
  readonly type: string;
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

export class Move implements Repeatable<MoveQuantum>, FakeDeprecatedJSON {
  readonly #quantum: MoveQuantum;
  readonly #amount: number;

  constructor(quantum: MoveQuantum, amount: number = 1) {
    // TODO: validate.
    this.#quantum = quantum;
    this.#amount = amount;
  }

  get amount(): number {
    return this.#amount;
  }

  /** @deprecated */
  get type(): string {
    return "blockMove";
  }

  toString(): string {
    return this.#quantum.toString() + repetitionSuffix(this.#amount);
  }
}

export class Alg implements FakeDeprecatedJSON {
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
