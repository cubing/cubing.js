import { Alg } from "../Alg";
import type { AlgNode } from "../alg-nodes/AlgNode";
import { Commutator } from "../alg-nodes/containers/Commutator";
import { Conjugate } from "../alg-nodes/containers/Conjugate";
import { Grouping } from "../alg-nodes/containers/Grouping";
import type { LineComment } from "../alg-nodes/leaves/LineComment";
import { Move } from "../alg-nodes/leaves/Move";
import type { Newline } from "../alg-nodes/leaves/Newline";
import { Pause } from "../alg-nodes/leaves/Pause";
import { functionFromTraversal, TraversalDownUp } from "../traversal";
import { experimentalAppendNode } from "./append";
import { AppendOptionsHelper, type SimplifyOptions } from "./options";

// TODO: Test that inverses are bijections.
class Simplify extends TraversalDownUp<SimplifyOptions, Generator<AlgNode>> {
  #newPlaceholderAssociationsMap?: Map<Grouping, Pause>;
  #newPlaceholderAssociations(): Map<Grouping, Pause> {
    return (this.#newPlaceholderAssociationsMap ??= new Map<Grouping, Pause>());
  }

  // TODO: avoid allocations?
  #descendOptions(options: SimplifyOptions): SimplifyOptions {
    return {
      ...options,
      depth: options.depth ? options.depth - 1 : null,
    };
  }

  // TODO: Handle
  public *traverseAlg(alg: Alg, options: SimplifyOptions): Generator<AlgNode> {
    if (options.depth === 0) {
      yield* alg.childAlgNodes();
      return;
    }

    let output: AlgNode[] = [];

    const newOptions: SimplifyOptions = this.#descendOptions(options); // TODO: avoid allocations?
    for (const algNode of alg.childAlgNodes()) {
      for (const traversedNode of this.traverseAlgNode(algNode, newOptions)) {
        output = Array.from(
          experimentalAppendNode(
            new Alg(output),
            traversedNode,
            newOptions,
          ).childAlgNodes(),
        );
      }
    }

    // TODO: try to use `yield* output[Symbol.iterator]();`?
    for (const newAlgNode of output) {
      yield newAlgNode;
    }
  }

  public *traverseGrouping(
    grouping: Grouping,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield grouping;
      return;
    }
    if (grouping.amount === 0) {
      // TODO: Are we okay with throwing away nested comments?
      return;
    }
    const newGrouping = new Grouping(
      this.traverseAlg(grouping.alg, this.#descendOptions(options)),
      grouping.amount,
    );
    if (newGrouping.alg.experimentalIsEmpty()) {
      return;
    }

    const newPlaceholder = this.#newPlaceholderAssociations().get(grouping);
    if (newPlaceholder) {
      newGrouping.experimentalNISSPlaceholder = newPlaceholder;
      newPlaceholder.experimentalNISSGrouping = newGrouping;
    }

    yield newGrouping;
  }

  public *traverseMove(
    move: Move,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    yield move;
  }

  #doChildrenCommute(A: Alg, B: Alg, options: SimplifyOptions): boolean {
    if (
      A.experimentalNumChildAlgNodes() === 1 &&
      B.experimentalNumChildAlgNodes() === 1
    ) {
      // Handle the special case where each side has been reduced to a single move.
      const aMove = Array.from(A.childAlgNodes())[0]?.as(Move);
      const bMove = Array.from(B.childAlgNodes())[0]?.as(Move);
      if (!(aMove && bMove)) {
        return false;
      }
      if (bMove.quantum.isIdentical(aMove.quantum)) {
        return true;
      }
      const appendOptionsHelper = new AppendOptionsHelper(options); // TODO: avoid re-allocating every time.
      if (
        appendOptionsHelper
          .puzzleSpecificSimplifyOptions()
          ?.axis?.areQuantumMovesSameAxis(aMove.quantum, bMove.quantum)
      ) {
        return true;
      }
    }
    return false;
  }

  public *traverseCommutator(
    commutator: Commutator,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield commutator;
      return;
    }
    const newOptions = this.#descendOptions(options);
    const newCommutator = new Commutator(
      this.traverseAlg(commutator.A, newOptions),
      this.traverseAlg(commutator.B, newOptions),
    );
    if (
      newCommutator.A.experimentalIsEmpty() ||
      newCommutator.B.experimentalIsEmpty() ||
      newCommutator.A.isIdentical(newCommutator.B) ||
      newCommutator.A.isIdentical(newCommutator.B.invert()) ||
      this.#doChildrenCommute(newCommutator.A, newCommutator.B, options)
    ) {
      return;
    }
    yield newCommutator;
  }

  public *traverseConjugate(
    conjugate: Conjugate,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield conjugate;
      return;
    }
    const newOptions = this.#descendOptions(options);
    const newConjugate = new Conjugate(
      this.traverseAlg(conjugate.A, newOptions),
      this.traverseAlg(conjugate.B, newOptions),
    );
    if (newConjugate.B.experimentalIsEmpty()) {
      return;
    }
    if (
      newConjugate.A.experimentalIsEmpty() ||
      newConjugate.A.isIdentical(newConjugate.B) ||
      newConjugate.A.isIdentical(newConjugate.B.invert()) ||
      this.#doChildrenCommute(newConjugate.A, newConjugate.B, options)
    ) {
      yield* conjugate.B.childAlgNodes();
      return;
    }
    yield newConjugate;
  }

  public *traversePause(
    pause: Pause,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (pause.experimentalNISSGrouping) {
      const newPause = new Pause();
      this.#newPlaceholderAssociations().set(
        pause.experimentalNISSGrouping,
        newPause,
      );
      yield newPause;
    } else {
      yield pause;
    }
  }

  public *traverseNewline(
    newline: Newline,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    yield newline;
  }

  public *traverseLineComment(
    comment: LineComment,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    yield comment;
  }
}

export const simplify = functionFromTraversal(Simplify);
