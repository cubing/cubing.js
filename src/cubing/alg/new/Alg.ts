import { AlgCommon, Comparable } from "./common";
import { direct, IterationDirection, reverse } from "./iteration";
import { parseAlg } from "./parse";
import { Newline } from "./units/leaves/Newline";
import { Pause } from "./units/leaves/Pause";
import { LeafUnit, Unit } from "./units/Unit";
import { warnOnce } from "./warnOnce";

export type FlexibleAlgSource = string | Iterable<Unit> | Alg;

// TODO: validate
function toIterable(inputUnits?: FlexibleAlgSource): Iterable<Unit> {
  if (!inputUnits) {
    return [];
  }

  if (typeof inputUnits === "string") {
    throw new Error("unimplemented");
    // return parseAlg(inputUnits).nestedUnits;
  }

  // const seq = inputUnits as Sequence;
  // if (seq.type === "sequence" && seq.nestedUnits) {
  //   throw new Error("unimplemented");
  //   // return seq.nestedUnits;
  // }

  const iter = inputUnits as Iterable<Unit>;
  if (typeof iter[Symbol.iterator] === "function") {
    return Array.from(iter); // TODO: avoid allocations
  }

  throw "Invalid unit";
}

export class Alg extends AlgCommon<Alg> {
  #units: Iterable<Unit>; // TODO: freeze?
  constructor(alg?: string | Iterable<Unit>) {
    super();
    this.#units = toIterable(alg);
  }

  isIdentical(other: Comparable): boolean {
    const otherAsAlg = other as Alg;
    if (!other.is(Alg)) {
      return false;
    }

    // TODO: avoid converting to array
    const l1 = Array.from(this.#units);
    const l2 = Array.from(otherAsAlg.#units);
    if (l1.length !== l2.length) {
      return false;
    }
    for (let i = 0; i < l1.length; i++) {
      if (!l1[i].isIdentical(l2[i])) {
        return false;
      }
    }
    return true;
  }

  inverse(): Alg {
    // TODO: Handle newLines and comments correctly
    return new Alg(reverse(Array.from(this.#units)));
  }

  *experimentalLeafUnits(
    iterDir: IterationDirection = IterationDirection.Forwards,
  ): Generator<LeafUnit> {
    for (const unit of direct(this.#units, iterDir)) {
      yield* unit.experimentalLeafUnits(iterDir);
    }
  }

  concat(input: FlexibleAlgSource): Alg {
    return new Alg(
      Array.from(this.#units).concat(Array.from(toIterable(input))),
    );
  }

  static fromString(s: string): Alg {
    return parseAlg(s);
  }

  // /** @deprecated */
  // get nestedUnits(): Unit[] {
  //   warnOnce("deprecated: nestedUnits");
  //   return Array.from(this.#units);
  // }

  *childUnits(): Generator<Unit> {
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
  if (u1.is(Pause) && u2.is(Pause)) {
    return "";
  }
  if (u1.is(Newline) || u2.is(Newline)) {
    return "";
  }
  if (u1.is(Comment) && !u2.is(Newline)) {
    return "\n"; /// TODO
  }
  return " ";
}
