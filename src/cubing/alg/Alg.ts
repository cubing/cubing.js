// https://js.cubing.net/cubing/alg/

import { Grouping, Pause } from "./alg-nodes";
import type { AlgLeaf, AlgNode } from "./alg-nodes/AlgNode";
import { LineComment } from "./alg-nodes/leaves/LineComment";
import { Move } from "./alg-nodes/leaves/Move";
import { Newline } from "./alg-nodes/leaves/Newline";
import { AlgCommon, type Comparable } from "./common";
import { experimentalIs, experimentalIsAlgNode } from "./is";
import { IterationDirection, direct, reverse } from "./iteration";
import { parseAlg } from "./parseAlg";
import type { ExperimentalSerializationOptions } from "./SerializationOptions";
import { simplify, type SimplifyOptions } from "./simplify";
import { warnOnce } from "./warnOnce";

export type FlexibleAlgSource = string | Iterable<AlgNode> | Alg;

// TODO: validate
function toIterable(input?: FlexibleAlgSource): Iterable<AlgNode> {
  if (!input) {
    return [];
  }

  if (experimentalIs(input, Alg)) {
    return (input as Alg).childAlgNodes();
  }

  if (typeof input === "string") {
    return parseAlg(input).childAlgNodes(); // TODO: something more direct?
  }

  const iter = input as Iterable<AlgNode>;
  if (typeof iter[Symbol.iterator] === "function") {
    return iter; // TODO: avoid allocations
  }

  throw new Error("Invalid AlgNode");
}

// Preserves the alg if it's already an `Alg`.
export function experimentalEnsureAlg(alg: FlexibleAlgSource): Alg {
  if (experimentalIs(alg, Alg)) {
    return alg as Alg;
  }
  return new Alg(alg);
}

/**
 * `Alg` is a class that encapsulates a structured alg. To create an `Alg` from a string, use:
 *
 *     new Alg("R U R'"); // Convenient
 *     Alg.fromString(dynamicString); // Recommended when the string input is user-provided.
 *
 * Once you have an `Alg`, you can call methods to transform it:
 *
 *     new Alg("[[R: U], R U R2']").expand().experimentalSimplify({cancel: true}).invert().log()
 *
 * To convert an `Alg` to a string, use .toString():
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
  #algNodes: Iterable<AlgNode>; // TODO: freeze?
  constructor(alg?: FlexibleAlgSource) {
    super();
    this.#algNodes = Array.from(toIterable(alg)); // TODO: can we avoid array-casting?
    // this.#debugString = this.toString();

    for (const algNode of this.#algNodes) {
      if (!experimentalIsAlgNode(algNode)) {
        throw new Error("An alg can only contain alg nodes.");
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
   * Also note that parser annotations are not taken into account while comparing
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
    const l1 = Array.from(this.#algNodes);
    const l2 = Array.from(otherAsAlg.#algNodes);
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
    return new Alg(reverse(Array.from(this.#algNodes).map((u) => u.invert())));
  }

  /** @deprecated Use {@link Alg.expand} instead. */
  *experimentalExpand(
    iterDir: IterationDirection = IterationDirection.Forwards,
    depth?: number,
  ): Generator<AlgLeaf> {
    depth ??= Infinity;
    for (const algNode of direct(this.#algNodes, iterDir)) {
      yield* algNode.experimentalExpand(iterDir, depth);
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
      Array.from(this.#algNodes).concat(Array.from(toIterable(input))),
    );
  }

  /** @deprecated */
  experimentalIsEmpty(): boolean {
    for (const _ of this.#algNodes) {
      return false;
    }
    return true;
  }

  static fromString(s: string): Alg {
    return parseAlg(s);
  }

  /** @deprecated */
  units(): Generator<AlgNode> {
    return this.childAlgNodes();
  }

  *childAlgNodes(): Generator<AlgNode> {
    for (const algNode of this.#algNodes) {
      yield algNode;
    }
  }

  /** @deprecated */
  experimentalNumUnits(): number {
    return this.experimentalNumChildAlgNodes();
  }

  experimentalNumChildAlgNodes(): number {
    return Array.from(this.#algNodes).length;
  }

  /** @deprecated */
  get type(): string {
    warnOnce("deprecated: type");
    return "sequence";
  }

  /**
   * Converts the Alg to a string:
   *
   *     const alg = new Alg([new Move("R"), new Move("U2"), new Move("L")])
   *     // R U2 L
   *     console.log(alg.toString())
   */
  toString(
    experimentalSerializationOptions?: ExperimentalSerializationOptions,
  ): string {
    let output = "";
    let previousVisibleAlgNode: AlgNode | null = null;
    for (const algNode of this.#algNodes) {
      if (previousVisibleAlgNode) {
        output += spaceBetween(previousVisibleAlgNode, algNode);
      }
      const nissGrouping = algNode.as(Pause)?.experimentalNISSGrouping;
      if (nissGrouping) {
        if (nissGrouping.amount !== -1) {
          throw new Error("Invalid NISS Grouping amount!");
        }
        output += `^(${nissGrouping.alg.toString(experimentalSerializationOptions)})`;
      } else if (algNode.as(Grouping)?.experimentalNISSPlaceholder) {
        // do not serialize (rely on the placeholder instead)
      } else {
        output += algNode.toString(experimentalSerializationOptions);
      }
      previousVisibleAlgNode = algNode;
    }
    return output;
  }

  /**
   * `experimentalSimplify` can perform several mostly-syntactic simplifications on an alg:
   *
   *     // Logs: R' U3
   *     import { Alg } from "cubing/alg";
   *     new Alg("R R2' U U2").experimentalSimplify({ cancel: true }).log()
   *
   * You can pass in a `PuzzleLoader` (currently only for 3x3x3) for puzzle-specific simplifications:
   *
   *     // Logs: R' U'
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *     new Alg("R R2' U U2").experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 }).log()
   *
   * You can also cancel only moves that are in the same direction:
   *
   *     // Logs: R R2' U'
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *     new Alg("R R2' U U2").experimentalSimplify({
   *       cancel: { directional: "same-direction" },
   *       puzzleLoader: cube3x3x3
   *     }).log()
   *
   * Additionally, you can specify how moves are "wrapped":
   *
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *
   *     function example(puzzleSpecificModWrap) {
   *       alg.experimentalSimplify({
   *         cancel: { puzzleSpecificModWrap },
   *         puzzleLoader: cube3x3x3
   *       }).log()
   *     }
   *
   *     const alg = new Alg("R7' . R6' . R5' . R6")
   *     example("none")               // R7' . R6' . R5' . R6
   *     example("gravity")            // R . R2' . R' . R2
   *     example("canonical-centered") // R . R2 . R' . R2
   *     example("canonical-positive") // R . R2 . R3 . R2
   *     example("preserve-sign")      // R3' . R2' . R' . R2
   *
   * Same-axis and simultaneous move canonicalization is not implemented yet:
   *
   *     // Logs: R L R
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *     new Alg("R L R").experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 }).log()
   */
  experimentalSimplify(options?: SimplifyOptions): Alg {
    return new Alg(simplify(this, options ?? {}));
  }

  /** @deprecated See {@link experimentalSimplify} */
  simplify(options?: SimplifyOptions): Alg {
    return this.experimentalSimplify(options);
  }
}

function spaceBetween(u1: AlgNode, u2: AlgNode): string {
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
