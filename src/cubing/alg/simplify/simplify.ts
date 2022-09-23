import type { Alg } from "../Alg";
import type { AlgNode } from "../alg-nodes/AlgNode";
import { Commutator } from "../alg-nodes/containers/Commutator";
import { Conjugate } from "../alg-nodes/containers/Conjugate";
import { Grouping } from "../alg-nodes/containers/Grouping";
import type { LineComment } from "../alg-nodes/leaves/LineComment";
import { Move } from "../alg-nodes/leaves/Move";
import type { Newline } from "../alg-nodes/leaves/Newline";
import { Pause } from "../alg-nodes/leaves/Pause";
import { TraversalDownUp } from "../traversal";
import type { SimplifyOptions } from "./options";


// TODO: Test that inverses are bijections.
class Simplify extends TraversalDownUp<SimplifyOptions, Generator<AlgNode>> {
  #newPlaceholderAssociationsMap?: Map<Grouping, Pause>;
  #newPlaceholderAssociations(): Map<Grouping, Pause> {
    return (this.#newPlaceholderAssociationsMap ??= new Map<Grouping, Pause>());
  }

  static #newAmount(
    move: Move,
    deltaAmount: number,
    options: SimplifyOptions,
  ): number {
    let newAmount = move.amount + deltaAmount;
    if (options?.puzzleSpecificAlgSimplifyInfo?.quantumMoveOrder) {
      const order = options.puzzleSpecificAlgSimplifyInfo.quantumMoveOrder(
        move.quantum,
      );
      // Examples:
      // • order 4 → min -1 (e.g. cube)
      // • order 5 → min -2 (e.g. Megaminx)
      // • order 3 → min -1 (e.g. Pyraminx)
      const min = Math.floor(order / 2) + 1 - order;
      newAmount = (((newAmount % order) + order - min) % order) + min; // TODO
    }
    return newAmount;
  }

  // TODO: Handle
  public *traverseAlg(alg: Alg, options: SimplifyOptions): Generator<AlgNode> {
    if (options.depth === 0) {
      yield* alg.childAlgNodes();
      return;
    }

    const newAlgNodes: AlgNode[] = [];
    let lastAlgNode: AlgNode | null = null;
    const collapseMoves = options?.collapseMoves ?? true;
    function appendMoveWithNewAmount(move: Move, deltaAmount: number): boolean {
      const newAmount = Simplify.#newAmount(move, deltaAmount, options);
      if (newAmount === 0) {
        return false;
      }
      const newMove = new Move(move.quantum, newAmount);
      newAlgNodes.push(newMove);
      lastAlgNode = newMove;
      return true;
    }
    function appendCollapsed(newAlgNode: AlgNode) {
      if (
        collapseMoves &&
        lastAlgNode?.is(Move) &&
        newAlgNode.is(Move) &&
        (lastAlgNode as Move).quantum.isIdentical((newAlgNode as Move).quantum)
      ) {
        newAlgNodes.pop();
        if (
          !appendMoveWithNewAmount(
            lastAlgNode as Move,
            (newAlgNode as Move).amount,
          )
        ) {
          lastAlgNode = newAlgNodes.slice(-1)[0];
        }
      } else {
        if (newAlgNode.is(Move)) {
          appendMoveWithNewAmount(newAlgNode as Move, 0);
        } else {
          newAlgNodes.push(newAlgNode);
          lastAlgNode = newAlgNode;
        }
      }
    }

    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    for (const algNode of alg.childAlgNodes()) {
      for (const ancestorAlgNode of this.traverseAlgNode(algNode, newOptions)) {
        appendCollapsed(ancestorAlgNode);
      }
    }
    for (const newAlgNode of newAlgNodes) {
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
