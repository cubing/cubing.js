import { Sequence } from "../algorithm";
import { algToString } from "../traversal";
import { AlgJSON, Serializable, UnitJSON } from "./Serializable";
import { Unit } from "./Unit";
import { warnOnce } from "./warnOnce";

// TODO: validate
function toIterable(
  inputUnits?: string | Sequence | Iterable<Unit>,
): Iterable<Unit> {
  if (!inputUnits) {
    return [];
  }

  if (typeof inputUnits === "string") {
    throw new Error("unimplemented");
    // return parseAlg(inputUnits).nestedUnits;
  }

  const seq = inputUnits as Sequence;
  if (seq.type === "sequence" && seq.nestedUnits) {
    throw new Error("unimplemented");
    // return seq.nestedUnits;
  }

  const iter = inputUnits as Iterable<Unit>;
  if (typeof iter[Symbol.iterator] === "function") {
    return iter;
  }

  throw "Invalid unit";
}

export class Alg implements Sequence, Serializable {
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
    return {
      type: "alg",
      units: Array.from(this.#units) as UnitJSON[],
    };
  }

  toString(): string {
    return algToString(new Sequence(this.nestedUnits));
  }
}
