import { Alg } from "./new/Alg";
import { Bunch } from "./new/units/containers/Bunch";
import { Comparable } from "./new/common";
import { Commutator } from "./new/units/containers/Commutator";
import { Move } from "./new/units/leaves/Move";
import { Newline } from "./new/units/leaves/Newline";
import { Pause } from "./new/units/leaves/Pause";
import { Conjugate } from "./new/units/containers/Conjugate";
import { Comment } from "./new/units/leaves/Comment";
import { Unit } from "./new/units/Unit";

function dispatch<DataDown, DataAlgUp, DataUnitUp>(
  t: TraversalDownUp<DataDown, DataAlgUp, DataUnitUp>,
  unit: Unit,
  dataDown: DataDown,
): DataUnitUp {
  // TODO: Can we turn this back into a `switch` or something more efficiently?
  if (unit.is(Bunch)) {
    return t.traverseBunch(unit as Bunch, dataDown);
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
  if (unit.is(Comment)) {
    return t.traverseComment(unit as Comment, dataDown);
  }
  throw new Error(`unknown unit`);
}

function assertIsUnit(t: Comparable): Unit {
  if (
    t.is(Bunch) ||
    t.is(Move) ||
    t.is(Commutator) ||
    t.is(Conjugate) ||
    t.is(Pause) ||
    t.is(Newline) ||
    t.is(Comment)
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

  public abstract traverseBunch(bunch: Bunch, dataDown: DataDown): DataUnitUp;
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

  public abstract traverseComment(
    comment: Comment,
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
  public abstract traverseBunch(bunch: Bunch): DataUnitUp;
  public abstract traverseMove(move: Move): DataUnitUp;
  public abstract traverseCommutator(commutator: Commutator): DataUnitUp;
  public abstract traverseConjugate(conjugate: Conjugate): DataUnitUp;
  public abstract traversePause(pause: Pause): DataUnitUp;
  public abstract traverseNewline(newline: Newline): DataUnitUp;
  public abstract traverseComment(comment: Comment): DataUnitUp;
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

//   public traverseBunch(bunch: Bunch): Unit {
//     return bunch;
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

//   public traverseComment(comment: Comment): Unit {
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
