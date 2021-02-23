import { Alg } from "./Alg";
import { Grouping } from "./units/containers/Grouping";
import { Comparable } from "./common";
import { Commutator } from "./units/containers/Commutator";
import { Move } from "./units/leaves/Move";
import { Newline } from "./units/leaves/Newline";
import { Pause } from "./units/leaves/Pause";
import { Conjugate } from "./units/containers/Conjugate";
import { LineComment } from "./units/leaves/LineComment";
import { Unit } from "./units/Unit";

function dispatch<DataDown, DataAlgUp, DataUnitUp>(
  t: TraversalDownUp<DataDown, DataAlgUp, DataUnitUp>,
  unit: Unit,
  dataDown: DataDown,
): DataUnitUp {
  // TODO: Can we turn this back into a `switch` or something more efficiently?
  if (unit.is(Grouping)) {
    return t.traverseGrouping(unit as Grouping, dataDown);
  }
  if (unit.is(Move)) {
    return t.traverseMove(unit as Move, dataDown);
  }
  if (unit.is(Commutator)) {
    return t.traverseCommutator(unit as Commutator, dataDown);
  }
  if (unit.is(Conjugate)) {
    return t.traverseConjugate(unit as Conjugate, dataDown);
  }
  if (unit.is(Pause)) {
    return t.traversePause(unit as Pause, dataDown);
  }
  if (unit.is(Newline)) {
    return t.traverseNewline(unit as Newline, dataDown);
  }
  if (unit.is(LineComment)) {
    return t.traverseLineComment(unit as LineComment, dataDown);
  }
  throw new Error(`unknown unit`);
}

function assertIsUnit(t: Comparable): Unit {
  if (
    t.is(Grouping) ||
    t.is(Move) ||
    t.is(Commutator) ||
    t.is(Conjugate) ||
    t.is(Pause) ||
    t.is(Newline) ||
    t.is(LineComment)
  ) {
    return t as Unit;
  }
  throw "internal error: expected unit"; // TODO: Make more helpful, add tests
}

export abstract class TraversalDownUp<
  DataDown,
  DataAlgUp,
  DataUnitUp = DataAlgUp
> {
  // Immediate subclasses should overwrite this.
  public traverseUnit(unit: Unit, dataDown: DataDown): DataUnitUp {
    return dispatch(this, unit, dataDown);
  }

  public traverseIntoUnit(unit: Unit, dataDown: DataDown): Unit {
    return assertIsUnit(this.traverseUnit(unit, dataDown) as any);
  }

  public abstract traverseAlg(alg: Alg, dataDown: DataDown): DataAlgUp;

  public abstract traverseGrouping(
    grouping: Grouping,
    dataDown: DataDown,
  ): DataUnitUp;

  public abstract traverseMove(move: Move, dataDown: DataDown): DataUnitUp;

  public abstract traverseCommutator(
    commutator: Commutator,
    dataDown: DataDown,
  ): DataUnitUp;

  public abstract traverseConjugate(
    conjugate: Conjugate,
    dataDown: DataDown,
  ): DataUnitUp;

  public abstract traversePause(pause: Pause, dataDown: DataDown): DataUnitUp;
  public abstract traverseNewline(
    newline: Newline,
    dataDown: DataDown,
  ): DataUnitUp;

  public abstract traverseLineComment(
    comment: LineComment,
    dataDown: DataDown,
  ): DataUnitUp;
}

export abstract class TraversalUp<
  DataAlgUp,
  DataUnitUp = DataAlgUp
> extends TraversalDownUp<undefined, DataAlgUp, DataUnitUp> {
  public traverseUnit(unit: Unit): DataUnitUp {
    return dispatch<unknown, DataAlgUp, DataUnitUp>(this, unit, undefined);
  }

  public traverseIntoUnit(unit: Unit): Unit {
    return assertIsUnit(this.traverseUnit(unit) as any);
  }

  public abstract traverseAlg(alg: Alg): DataAlgUp;
  public abstract traverseGrouping(grouping: Grouping): DataUnitUp;
  public abstract traverseMove(move: Move): DataUnitUp;
  public abstract traverseCommutator(commutator: Commutator): DataUnitUp;
  public abstract traverseConjugate(conjugate: Conjugate): DataUnitUp;
  public abstract traversePause(pause: Pause): DataUnitUp;
  public abstract traverseNewline(newline: Newline): DataUnitUp;
  public abstract traverseLineComment(comment: LineComment): DataUnitUp;
}

export interface SimplifyOptions {
  collapseMoves?: boolean;
  depth?: number | null;
}

// TODO: Test that inverses are bijections.
class Simplify extends TraversalDownUp<SimplifyOptions, Generator<Unit>> {
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
          const newAmount = lastMove.effectiveAmount + newMove.effectiveAmount;
          if (newAmount !== 0) {
            const coalescedMove = new Move(lastMove.quantum, newAmount);
            newUnits.push(coalescedMove);
            lastUnit = coalescedMove;
          } else {
            lastUnit = newUnits.slice(-1)[0];
          }
        } else {
          newUnits.push(newUnit);
          lastUnit = newUnit;
        }
      } else {
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
    yield new Grouping(this.traverseAlg(grouping.experimentalAlg, newOptions));
  }

  public *traverseMove(move: Move, _options: SimplifyOptions): Generator<Unit> {
    yield move;
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
    pause: Pause,
    _options: SimplifyOptions,
  ): Generator<Unit> {
    yield pause;
  }

  public *traverseNewline(
    newline: Newline,
    _options: SimplifyOptions,
  ): Generator<Unit> {
    yield newline;
  }

  public *traverseLineComment(
    comment: LineComment,
    _options: SimplifyOptions,
  ): Generator<Unit> {
    yield comment;
  }
}

const simplifyInstance = new Simplify();
export const simplify = simplifyInstance.traverseAlg.bind(simplifyInstance) as (
  alg: Alg,
  options: SimplifyOptions,
) => Generator<Unit>;
