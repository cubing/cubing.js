import { puzzleSpecificAppendOptions333 } from "../../puzzles/implementations/3x3x3/puzzle-specific-simplifications";
import { Alg } from "../Alg";
import type { AlgNode } from "../alg-nodes/AlgNode";
import { Commutator } from "../alg-nodes/containers/Commutator";
import { Conjugate } from "../alg-nodes/containers/Conjugate";
import { Grouping } from "../alg-nodes/containers/Grouping";
import type { LineComment } from "../alg-nodes/leaves/LineComment";
import type { Move } from "../alg-nodes/leaves/Move";
import type { Newline } from "../alg-nodes/leaves/Newline";
import { Pause } from "../alg-nodes/leaves/Pause";
import { TraversalDownUp } from "../traversal";
import { experimentalAppendNode } from "./append";
import type { SimplifyOptions } from "./options";

// TODO: Test that inverses are bijections.
class Simplify extends TraversalDownUp<SimplifyOptions, Generator<AlgNode>> {
  #newPlaceholderAssociationsMap?: Map<Grouping, Pause>;
  #newPlaceholderAssociations(): Map<Grouping, Pause> {
    return (this.#newPlaceholderAssociationsMap ??= new Map<Grouping, Pause>());
  }

  // TODO: Handle
  public *traverseAlg(alg: Alg, options: SimplifyOptions): Generator<AlgNode> {
    if (options.depth === 0) {
      yield* alg.childAlgNodes();
      return;
    }

    let output: AlgNode[] = [];

    const newOptions: SimplifyOptions = {
      ...options,
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    for (const algNode of alg.childAlgNodes()) {
      for (const traversedNode of this.traverseAlgNode(algNode, newOptions)) {
        // TODO: remove empty containers?
        output = Array.from(
          experimentalAppendNode(
            new Alg(output),
            traversedNode,
            newOptions,
          ).childAlgNodes(),
        );
      }
    }

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
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    const newGrouping = new Grouping(
      this.traverseAlg(grouping.alg, newOptions),
      grouping.amount,
    );

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

  public *traverseCommutator(
    commutator: Commutator,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield commutator;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    yield new Commutator(
      this.traverseAlg(commutator.A, newOptions),
      this.traverseAlg(commutator.B, newOptions),
    );
  }

  public *traverseConjugate(
    conjugate: Conjugate,
    options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (options.depth === 0) {
      yield conjugate;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    yield new Conjugate(
      this.traverseAlg(conjugate.A, newOptions),
      this.traverseAlg(conjugate.B, newOptions),
    );
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

const simplifyInstance = new Simplify();
export const simplify = simplifyInstance.traverseAlg.bind(simplifyInstance) as (
  alg: Alg,
  options: SimplifyOptions,
) => Generator<AlgNode>;
