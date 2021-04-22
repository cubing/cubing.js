import { AlgCommon, Comparable } from "./common";
import { experimentalIs, experimentalIsUnit } from "./is";
import { direct, IterationDirection, reverse } from "./iteration";
import { parseAlg } from "./parse";
import { SimplifyOptions, simplify } from "./traversal";
import { LineComment } from "./units/leaves/LineComment";
import { Move } from "./units/leaves/Move";
import { Newline } from "./units/leaves/Newline";
import { Pause } from "./units/leaves/Pause";
import { LeafUnit, Unit } from "./units/Unit";
import { warnOnce } from "./warnOnce";

export type FlexibleAlgSource = string | Iterable<Unit> | Alg;

// TODO: validate
function toIterable(input?: FlexibleAlgSource): Iterable<Unit> {
  if (!input) {
    return [];
  }

  if (experimentalIs(input, Alg)) {
    return (input as Alg).units();
  }

  if (typeof input === "string") {
    return parseAlg(input).units(); // TODO: something more direct?
  }

  // const seq = inputUnits as Sequence;
  // if (seq.type === "sequence" && seq.nestedUnits) {
  //   throw new Error("unimplemented");
  //   // return seq.nestedUnits;
  // }

  const iter = input as Iterable<Unit>;
  if (typeof iter[Symbol.iterator] === "function") {
    return iter; // TODO: avoid allocations
  }

  throw "Invalid unit";
}

// Preserves the alg if it's already an `Alg`.
export function experimentalEnsureAlg(alg: FlexibleAlgSource): Alg {
  if (experimentalIs(alg, Alg)) {
    return alg as Alg;
  }
  return new Alg(alg);
}

export class Alg extends AlgCommon<Alg> {
  #units: Iterable<Unit>; // TODO: freeze?
  constructor(alg?: FlexibleAlgSource) {
    super();
    this.#units = Array.from(toIterable(alg)); // TODO: can we avoid array-casting?

    for (const unit of this.#units) {
      if (!experimentalIsUnit(unit)) {
        throw new Error("An alg can only contain units.");
      }
    }
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

  invert(): Alg {
    // TODO: Handle newLines and comments correctly
    // TODO: Make more efficient.
    return new Alg(reverse(Array.from(this.#units).map((u) => u.invert())));
  }

  /** @deprecated */
  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth?: number,
  ): Generator<LeafUnit> {
    depth ??= Infinity;
    for (const unit of direct(this.#units, iterDir)) {
      yield* unit.experimentalExpand(iterDir, depth);
    }
  }

  expand(options?: { depth?: number }): Alg {
    return new Alg(
      this.experimentalExpand(
        IterationDirection.Forwards,
        options?.depth ?? Infinity,
      ),
    );
  }

  /** @deprecated */
  *experimentalLeafMoves(): Generator<Move> {
    for (const leaf of this.experimentalExpand()) {
      if (leaf.is(Move)) {
        yield leaf as Move;
      }
    }
  }

  concat(input: FlexibleAlgSource): Alg {
    return new Alg(
      Array.from(this.#units).concat(Array.from(toIterable(input))),
    );
  }

  /** @deprecated */
  experimentalIsEmpty(): boolean {
    for (const _ of this.#units) {
      return false;
    }
    return true;
  }

  static fromString(s: string): Alg {
    return parseAlg(s);
  }

  *units(): Generator<Unit> {
    for (const unit of this.#units) {
      yield unit;
    }
  }

  experimentalNumUnits(): number {
    return Array.from(this.#units).length;
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

  // *experimentalExpand(options: ExperimentalExpandOptions): Generator<Unit> {
  //   // if (options.depth === 0) {
  //   //   yield* this.units();
  //   //   return;
  //   // }
  //   // const newOptions = {
  //   //   depth: options.depth ? options.depth - 1 : null,
  //   // }; // TODO: avoid allocations?
  //   // for (const unit of this.#units) {
  //   //   yield* unit.experimentalExpandIntoAlg(newOptions);
  //   // }
  // }

  simplify(options?: SimplifyOptions): Alg {
    return new Alg(simplify(this, options ?? {}));
  }
}

function spaceBetween(u1: Unit, u2: Unit): string {
  if (u1.is(Pause) && u2.is(Pause)) {
    return "";
  }
  if (u1.is(Newline) || u2.is(Newline)) {
    return "";
  }
  if (u1.is(LineComment) && !u2.is(Newline)) {
    return "\n"; /// TODO
  }
  return " ";
}
