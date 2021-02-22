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

// // TODO: Test that inverses are bijections.
// export class CoalesceBaseMoves extends TraversalUp<Unit> {
//   // TODO: Handle
//   public traverseAlg(alg: Alg): Alg {
//     const coalesced: Unit[] = [];
//     for (const part of alg.nestedUnits) {
//       if (!matchesAlgType(part, "move")) {
//         coalesced.push(this.traverseIntoUnit(part));
//       } else if (coalesced.length > 0) {
//         const last = coalesced[coalesced.length - 1];
//         if (
//           matchesAlgType(last, "move") &&
//           this.sameBlock(last as Move, part as Move)
//         ) {
//           // TODO: This is cube-specific. Perhaps pass the modules as DataDown?
//           const amount = (last as Move).amount + (part as Move).amount;
//           coalesced.pop();
//           if (amount !== 0) {
//             // We could modify the last element instead of creating a new one,
//             // but this is safe against shifting coding practices.
//             // TODO: Figure out if the shoot-in-the-foot risk
//             // modification is worth the speed.
//             coalesced.push(
//               new Move(
//                 (part as Move).outerLayer,
//                 (part as Move).innerLayer,
//                 (part as Move).family,
//                 amount,
//               ),
//             );
//           }
//         } else {
//           coalesced.push(part);
//         }
//       } else {
//         coalesced.push(part);
//       }
//     }
//     return new Alg(coalesced);
//   }

//   public traverseGrouping(grouping: Grouping): Unit {
//     return grouping;
//   }

//   public traverseMove(move: Move): Unit {
//     return move;
//   }

//   public traverseCommutator(commutator: Commutator): Unit {
//     return commutator;
//   }

//   public traverseConjugate(conjugate: Conjugate): Unit {
//     return conjugate;
//   }

//   public traversePause(pause: Pause): Unit {
//     return pause;
//   }

//   public traverseNewline(newline: Newline): Unit {
//     return newline;
//   }

//   public traverseLineComment(comment: LineComment): Unit {
//     return comment;
//   }

//   private sameBlock(moveA: Move, moveB: Move): boolean {
//     // TODO: Handle layers
//     return (
//       moveA.outerLayer === moveB.outerLayer &&
//       moveA.innerLayer === moveB.innerLayer &&
//       moveA.family === moveB.family
//     );
//   }
// }

// const coalesceBaseMovesInstance = new CoalesceBaseMoves();

// export const coalesceBaseMoves = coalesceBaseMovesInstance.traverseAlg.bind(
//   coalesceBaseMovesInstance,
// ) as (a: Alg) => Alg;
