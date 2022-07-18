import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
  AlgNode,
} from "../../../../../cubing/alg";
import type { SimplifyOptions } from "../../../../../cubing/alg/traversal";

// TODO: Test that inverses are bijections.
class Normalize extends TraversalDownUp<SimplifyOptions, Generator<AlgNode>> {
  // TODO: Handle
  public *traverseAlg(alg: Alg, options: SimplifyOptions): Generator<AlgNode> {
    if (options.depth === 0) {
      yield* alg.childAlgNodes();
      return;
    }

    const newAlgNodes: AlgNode[] = [];
    let lastAlgNode: AlgNode | null = null;
    const collapseMoves = options?.collapseMoves ?? true;
    function appendCollapsed(newAlgNode: AlgNode) {
      if (collapseMoves && lastAlgNode?.is(Move) && newAlgNode.is(Move)) {
        const lastMove = lastAlgNode as Move;
        const newMove = newAlgNode as Move;
        if (lastMove.quantum.isIdentical(newMove.quantum)) {
          newAlgNodes.pop();
          let newAmount = lastMove.amount + newMove.amount;
          if (options?.quantumMoveOrder) {
            const order = options.quantumMoveOrder(lastMove.quantum);
            newAmount = (((newAmount % order) + order + 1) % order) - 1; // TODO
          }
          if (newAmount !== 0) {
            const coalescedMove = new Move(lastMove.quantum, newAmount);
            newAlgNodes.push(coalescedMove);
            lastAlgNode = coalescedMove;
          } else {
            lastAlgNode = newAlgNodes.slice(-1)[0];
          }
        } else {
          // TODO: handle quantum move order
          newAlgNodes.push(newAlgNode);
          lastAlgNode = newAlgNode;
        }
      } else {
        // TODO: handle quantum move order
        newAlgNodes.push(newAlgNode);
        lastAlgNode = newAlgNode;
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
    yield new Grouping(this.traverseAlg(grouping.alg, newOptions));
  }

  public *traverseMove(
    move: Move,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    if (move.amount === -2) {
      yield move.modified({ amount: 2 });
    } else {
      yield move;
    }
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
    _pause: Pause,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    // Nothing!
  }

  public *traverseNewline(
    _newline: Newline,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    // Nothing!
  }

  public *traverseLineComment(
    _comment: LineComment,
    _options: SimplifyOptions,
  ): Generator<AlgNode> {
    // Nothing!
  }
}

const normalizeInstance = new Normalize();
export const normalize: (
  alg: Alg,
  options: SimplifyOptions,
) => Generator<AlgNode> = normalizeInstance.traverseAlg.bind(normalizeInstance);
