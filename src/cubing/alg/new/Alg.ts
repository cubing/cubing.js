import { Sequence } from "../algorithm";
import { Newline } from "./Newline";
import { parseAlg } from "./parse";
import { Pause } from "./Pause";
import { Serializable } from "./Serializable";
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
    return Array.from(iter); // TODO: avoid allocations
  }

  throw "Invalid unit";
}

export class Alg implements Serializable {
  #units: Iterable<Unit>; // TODO: freeze?
  constructor(alg?: string | Sequence | Iterable<Unit>) {
    this.#units = toIterable(alg);
  }

  static fromString(s: string): Alg {
    return parseAlg(s);
  }

  // /** @deprecated */
  // get nestedUnits(): Unit[] {
  //   warnOnce("deprecated: nestedUnits");
  //   return Array.from(this.#units);
  // }

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

  // toJSON(): AlgJSON {
  //   return {
  //     type: "alg",
  //     units: Array.from(this.#units) as UnitJSON[],
  //   };
  // }

  toString(): string {
    let output = "";
    let previousUnit: Unit | null = null;
    for (const unit of this.#units) {
      if (previousUnit) {
        output += spaceBetween(previousUnit, unit);
        // console.log("l", previousUnit.toString(), unit.toString(), output);
      }
      output += unit.toString();
      previousUnit = unit;
    }
    return output;
  }
}

function spaceBetween(u1: Unit, u2: Unit): string {
  if (u1 instanceof Pause && u2 instanceof Pause) {
    return "";
  }
  if (u1 instanceof Newline || u2 instanceof Newline) {
    return "";
  }
  if (u1 instanceof Comment && !(u2 instanceof Newline)) {
    return "\n"; /// TODO
  }
  return " ";
}
