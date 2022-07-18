// https://js.cubing.net/cubing/alg/

import { AlgCommon, Comparable } from "./common";
import { experimentalIs, experimentalIsUnit } from "./is";
import { direct, IterationDirection, reverse } from "./iteration";
import { parseAlg } from "./parse";
import { simplify, SimplifyOptions } from "./traversal";
import { Grouping, Pause } from "./units";
import { LineComment } from "./units/leaves/LineComment";
import { Move } from "./units/leaves/Move";
import { Newline } from "./units/leaves/Newline";
import type { LeafUnit, Unit } from "./units/Unit";
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

  throw new Error("Invalid unit");
}

// Preserves the alg if it's already an `Alg`.
export function experimentalEnsureAlg(alg: FlexibleAlgSource): Alg {
  if (experimentalIs(alg, Alg)) {
    return alg as Alg;
  }
  return new Alg(alg);
}

/**
 * Alg is a class that encapsulates a structured alg. To create an alg from a string, use:
 *
 *     new Alg("R U R'"); // Convenient
 *     Alg.fromString(dynamicString); // Recommended when user-provided string input.
 *
 * Once you have an Alg, you can call methods to transform it:
 *
 *     new Alg("[[R: U], R U R2']").expand().simplify().invert();
 *
 * To convert an Alg to a string, use .toString():
 *
 *     new Alg("R U F").invert().toString();
 *
 * If you need to debug, you may also find it convenient to use .log():
 *
 *     if (alg.isIdentical(alg.invert())) {
 *       alg.log("A self-inverse!")
 *     }
 *
 * For more information, see: {@link https://js.cubing.net/cubing/alg/}
 *
 * @category Alg
 */
export class Alg extends AlgCommon<Alg> {
  // #debugString: string;
  #units: Iterable<Unit>; // TODO: freeze?
  constructor(alg?: FlexibleAlgSource) {
    super();
    this.#units = Array.from(toIterable(alg)); // TODO: can we avoid array-casting?
    // this.#debugString = this.toString();

    for (const unit of this.#units) {
      if (!experimentalIsUnit(unit)) {
        throw new Error("An alg can only contain units.");
      }
    }
  }

  /**
   * Checks whether this Alg is structurally identical to another Alg. This
   * essentially means that they are written identically apart from whitespace.
   *
   *     const alg1 = new Alg("R U L'");
   *     const alg2 = new Alg("L U' R'").invert();
   *     // true
   *     alg1.isIdentical(alg2);
   *
   *     // false
   *     new Alg("[R, U]").isIdentical(new Alg("R U R' U'"));
   *     // true
   *     new Alg("[R, U]").expand().isIdentical(new Alg("R U R' U'"));
   *
   * Note that .isIdentical() efficiently compares algorithms, but mainly exists
   * to help optimize code when the structure of an algorithm hasn't changed.
   * There are many ways to write the "same" alg on most puzzles, but is
   * *highly* recommended to avoid expanding two Alg instances to compare them,
   * since that can easily slow your program to a crawl if someone inputs an alg
   * containing a large repetition. In general, you should use `cubing/kpuzzle`
   * to compare if two algs have the same effect on a puzzle.
   *
   * Also note that parser annotations are not take into account while comparing
   * algs:
   *
   *     const alg = new Alg([new Move("R"), new Move("U2")]);
   *     // true, even though one of the algs has parser annotations
   *     alg.isIdentical(new Alg("R U2"))
   *
   */
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

  /**
   * Returns the inverse of the given alg.
   *
   * Note that that this does not make any assumptions about what puzzle the alg
   * is for. For example, U2 is its own inverse on a cube, but U2' has the same
   * effect U3 (and not U2) on Megaminx:
   *
   *     // Outputs: R U2' L'
   *     new Alg("L U2 R'").invert().log();
   */
  invert(): Alg {
    // TODO: Handle newLines and comments correctly
    // TODO: Make more efficient.
    return new Alg(reverse(Array.from(this.#units).map((u) => u.invert())));
  }

  /** @deprecated Use {@link Alg.expand} instead. */
  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth?: number,
  ): Generator<LeafUnit> {
    depth ??= Infinity;
    for (const unit of direct(this.#units, iterDir)) {
      yield* unit.experimentalExpand(iterDir, depth);
    }
  }

  /**
   * Expands all Grouping, Commutator, and Conjugate parts nested inside the
   * alg.
   *
   *     // F R U R' U' F'
   *     new Alg("[F: [R, U]]").expand().log();
   *
   *     // F [R, U] F'
   *     new Alg("[F: [R, U]]").expand(({ depth: 1 }).log();
   *
   * Avoid calling this on a user-provided alg unless the user explicitly asks
   * to see the expanded alg. Otherwise, it's easy to make your program freeze
   * when someone passes in an alg like: (R U)10000000
   *
   * Generally, if you want to perform an operation on an entire alg, you'll
   * want to use something based on the `Traversal` mechanism, like countMoves()
   * from `cubing/notation`.
   */
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /**
   * Converts the Alg to a string:
   *
   *     const alg = new Alg([new Move("R"), new Move("U2"), new Move("L")])
   *     // R U2 L
   *     console.log(alg.toString())
   */
  toString(): string {
    let output = "";
    let previousVisibleUnit: Unit | null = null;
    for (const unit of this.#units) {
      if (previousVisibleUnit) {
        output += spaceBetween(previousVisibleUnit, unit);
        // console.log("l", previousUnit.toString(), unit.toString(), output);
      }
      const nissGrouping = unit.as(Pause)?.experimentalNISSGrouping;
      if (nissGrouping) {
        if (nissGrouping.amount !== -1) {
          throw new Error("Invalid NISS Grouping amount!");
        }
        output += `^(${nissGrouping.alg.toString()})`;
      } else if (unit.as(Grouping)?.experimentalNISSPlaceholder) {
        // do not serialize (rely on the placeholder instead)
      } else {
        output += unit.toString();
      }
      previousVisibleUnit = unit;
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
  if (u1.is(Newline) || u2.is(Newline)) {
    return "";
  }
  if (u2.as(Grouping)?.experimentalNISSPlaceholder) {
    return "";
  }
  if (u1.is(LineComment) && !u2.is(Newline)) {
    return "\n"; /// TODO
  }
  return " ";
}
