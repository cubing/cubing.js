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
  Unit,
} from "../../../../cubing/alg";
import type { SimplifyOptions } from "../../../../cubing/alg/traversal";

// TODO: Test that inverses are bijections.
class Normalize extends TraversalDownUp<SimplifyOptions, Generator<Unit>> {
  // TODO: Handle
  public *traverseAlg(alg: Alg, options: SimplifyOptions): Generator<Unit> {
    if (options.depth === 0) {
      yield* alg.units();
      return;
    }

    const newUnits: Unit[] = [];
    let lastUnit: Unit | null = null;
    const collapseMoves = options?.collapseMoves ?? true;
    function appendCollapsed(newUnit: Unit) {
      if (collapseMoves && lastUnit?.is(Move) && newUnit.is(Move)) {
        const lastMove = lastUnit as Move;
        const newMove = newUnit as Move;
        if (lastMove.quantum.isIdentical(newMove.quantum)) {
          newUnits.pop();
          let newAmount = lastMove.amount + newMove.amount;
          if (options?.quantumMoveOrder) {
            const order = options.quantumMoveOrder(lastMove.quantum);
            newAmount = (((newAmount % order) + order + 1) % order) - 1; // TODO
          }
          if (newAmount !== 0) {
            const coalescedMove = new Move(lastMove.quantum, newAmount);
            newUnits.push(coalescedMove);
            lastUnit = coalescedMove;
          } else {
            lastUnit = newUnits.slice(-1)[0];
          }
        } else {
          // TODO: handle quantum move order
          newUnits.push(newUnit);
          lastUnit = newUnit;
        }
      } else {
        // TODO: handle quantum move order
        newUnits.push(newUnit);
        lastUnit = newUnit;
      }
    }

    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    for (const unit of alg.units()) {
      for (const ancestorUnit of this.traverseUnit(unit, newOptions)) {
        appendCollapsed(ancestorUnit);
      }
    }
    for (const unit of newUnits) {
      yield unit;
    }
  }

  public *traverseGrouping(
    grouping: Grouping,
    options: SimplifyOptions,
  ): Generator<Unit> {
    if (options.depth === 0) {
      yield grouping;
      return;
    }
    const newOptions = {
      depth: options.depth ? options.depth - 1 : null,
    }; // TODO: avoid allocations?
    yield new Grouping(this.traverseAlg(grouping.alg, newOptions));
  }

  public *traverseMove(move: Move, _options: SimplifyOptions): Generator<Unit> {
    if (move.amount === -2) {
      yield move.modified({ amount: 2 });
    } else {
      yield move;
    }
  }

  public *traverseCommutator(
    commutator: Commutator,
    options: SimplifyOptions,
  ): Generator<Unit> {
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
  ): Generator<Unit> {
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
  ): Generator<Unit> {
    // Nothing!
  }

  public *traverseNewline(
    _newline: Newline,
    _options: SimplifyOptions,
  ): Generator<Unit> {
    // Nothing!
  }

  public *traverseLineComment(
    _comment: LineComment,
    _options: SimplifyOptions,
  ): Generator<Unit> {
    // Nothing!
  }
}

const normalizeInstance = new Normalize();
export const normalize: (
  alg: Alg,
  options: SimplifyOptions,
) => Generator<Unit> = normalizeInstance.traverseAlg.bind(normalizeInstance);
