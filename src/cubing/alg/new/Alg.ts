import { Sequence, Unit } from "../algorithm";
import { AlgJSON } from "../json";
import { parseAlg } from "../parser";
import { algToString } from "../traversal";
import { warnOnce } from "./warnOnce";

// TODO: validate
function toIterable(
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

export class Alg implements Sequence {
  #units: Iterable<Unit>;
  constructor(alg?: string | Sequence | Iterable<Unit>) {
    this.#units = toIterable(alg);
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
