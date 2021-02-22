import { Alg } from "./new/Alg";
import { Bunch } from "./new/Bunch";
import { Comment } from "./new/Comment";
import { Comparable, reverse } from "./new/common";
import { Commutator } from "./new/Commutator";
import { Conjugate } from "./new/Conjugate";
import { Move } from "./new/Move";
import { Newline } from "./new/Newline";
import { Pause } from "./new/Pause";
import { Unit } from "./new/Unit";

function dispatch<DataDown, DataUp>(
  t: TraversalDownUp<DataDown, DataUp>,
  unit: Unit,
  dataDown: DataDown,
): DataUp {
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
    return t;
  }
  throw "internal error: expected unit"; // TODO: Make more helpful, add tests
}

export abstract class TraversalDownUp<DataDown, DataAlgUp, DataUnitUp> {
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
  DataUnitUp
> extends TraversalDownUp<undefined, DataAlgUp, DataUnitUp> {
  public traverseUnit(unit: Unit): DataUnitUp {
    return dispatch<undefined, DataUnitUp>(this, unit, undefined);
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

// TODO: Test that inverses are bijections.
export class Invert extends TraversalUp<Alg, Unit> {
  public traverseAlg(alg: Alg): Alg {
    // TODO: Handle newlines and comments correctly
    return new Alg(
      reverse(Array.from(alg.units(), (a) => this.traverseIntoUnit(a))),
    );
  }

  public traverseBunch(bunch: Bunch): Unit {
    return new Bunch(this.traverseAlg(bunch.nestedAlg), bunch.amount);
  }

  public traverseMove(move: Move): Unit {
    return new Move(
      move.outerLayer,
      move.innerLayer,
      move.family,
      -move.amount,
    );
  }

  public traverseCommutator(commutator: Commutator): Unit {
    return new Commutator(commutator.B, commutator.A, commutator.amount);
  }

  public traverseConjugate(conjugate: Conjugate): Unit {
    return new Conjugate(
      conjugate.A,
      this.traverseAlg(conjugate.B),
      conjugate.amount,
    );
  }

  public traversePause(pause: Pause): Unit {
    return pause;
  }

  public traverseNewline(newline: Newline): Unit {
    return newline;
  }

  public traverseComment(comment: Comment): Unit {
    return comment;
  }
}

export class Expand extends TraversalUp<Unit> {
  public traverseAlg(alg: Alg): Alg {
    return new Alg(
      this.flattenAlgOneLevel(alg.nestedUnits.map((a) => this.traverseUnit(a))),
    );
  }

  public traverseBunch(bunch: Bunch): Unit {
    // TODO: Pass raw Unit[] to alg.
    return this.repeat(
      this.flattenAlgOneLevel([this.traverseUnit(bunch.nestedAlg)]),
      bunch,
    );
  }

  public traverseMove(move: Move): Unit {
    return move;
  }

  public traverseCommutator(commutator: Commutator): Unit {
    const expandedA = this.traverseAlg(commutator.A);
    const expandedB = this.traverseAlg(commutator.B);
    let once: Unit[] = [];
    once = once.concat(
      expandedA,
      expandedB,
      invert(expandedA),
      invert(expandedB),
    );
    return this.repeat(this.flattenAlgOneLevel(once), commutator);
  }

  public traverseConjugate(conjugate: Conjugate): Unit {
    const expandedA = this.traverseAlg(conjugate.A);
    const expandedB = this.traverseAlg(conjugate.B);
    let once: Unit[] = [];
    once = once.concat(expandedA, expandedB, invert(expandedA));
    return this.repeat(this.flattenAlgOneLevel(once), conjugate);
  }

  public traversePause(pause: Pause): Unit {
    return pause;
  }

  public traverseNewline(newline: Newline): Unit {
    return newline;
  }

  public traverseComment(comment: Comment): Unit {
    return comment;
  }

  private flattenAlgOneLevel(algList: Unit[]): Unit[] {
    let flattened: Unit[] = [];
    for (const part of algList) {
      if (matchesAlgType(part, "alg")) {
        flattened = flattened.concat((part as Alg).nestedUnits);
      } else if (isUnit(part)) {
        flattened.push(part);
      } else {
        throw new Error(
          "expand() encountered an internal error. Did you pass in a valid Algorithm?",
        );
      }
    }
    return flattened;
  }

  private repeat(algList: Unit[], accordingTo: WithAmount): Alg {
    const amount = Math.abs(accordingTo.amount);
    const amountDir = accordingTo.amount > 0 ? 1 : -1; // Mutable

    // TODO: Cleaner inversion
    let once: Unit[];
    if (amountDir === -1) {
      // TODO: Avoid casting to alg.
      once = (invert(new Alg(algList)) as Alg).nestedUnits;
    } else {
      once = algList;
    }

    let repeated: Unit[] = [];
    for (let i = 0; i < amount; i++) {
      repeated = repeated.concat(once);
    }

    return new Alg(repeated);
  }
}

export class StructureEquals extends TraversalDownUp<Unit, boolean> {
  public traverseAlg(alg: Alg, dataDown: Unit): boolean {
    if (isUnit(dataDown)) {
      return false;
    }
    const dataDownSeq = dataDown as Alg;
    if (alg.nestedUnits.length !== dataDownSeq.nestedUnits.length) {
      return false;
    }
    for (let i = 0; i < alg.nestedUnits.length; i++) {
      if (!this.traverseUnit(alg.nestedUnits[i], dataDownSeq.nestedUnits[i])) {
        return false;
      }
    }
    return true;
  }

  public traverseBunch(bunch: Bunch, dataDown: Unit): boolean {
    return (
      matchesAlgType(dataDown, "bunch") &&
      this.traverseUnit(bunch.nestedAlg, (dataDown as Bunch).nestedAlg)
    );
  }

  public traverseMove(move: Move, dataDown: Unit): boolean {
    // TODO: Handle layers.
    return (
      matchesAlgType(dataDown, "move") &&
      move.outerLayer === (dataDown as Move).outerLayer &&
      move.innerLayer === (dataDown as Move).innerLayer &&
      move.family === (dataDown as Move).family &&
      move.amount === (dataDown as Move).amount
    );
  }

  public traverseCommutator(commutator: Commutator, dataDown: Unit): boolean {
    return (
      matchesAlgType(dataDown, "commutator") &&
      this.traverseUnit(commutator.A, (dataDown as Commutator).A) &&
      this.traverseUnit(commutator.B, (dataDown as Commutator).B)
    );
  }

  public traverseConjugate(conjugate: Conjugate, dataDown: Unit): boolean {
    return (
      matchesAlgType(dataDown, "conjugate") &&
      this.traverseUnit(conjugate.A, (dataDown as Conjugate).A) &&
      this.traverseUnit(conjugate.B, (dataDown as Conjugate).B)
    );
  }

  public traversePause(_pause: Pause, dataDown: Unit): boolean {
    return matchesAlgType(dataDown, "pause");
  }

  public traverseNewline(_newline: Newline, dataDown: Unit): boolean {
    return matchesAlgType(dataDown, "newline");
  }

  public traverseComment(comment: Comment, dataDown: Unit): boolean {
    return (
      matchesAlgType(dataDown, "comment") &&
      comment.comment === (dataDown as Comment).comment
    );
  }
}

// TODO: Test that inverses are bijections.
export class CoalesceBaseMoves extends TraversalUp<Unit> {
  // TODO: Handle
  public traverseAlg(alg: Alg): Alg {
    const coalesced: Unit[] = [];
    for (const part of alg.nestedUnits) {
      if (!matchesAlgType(part, "move")) {
        coalesced.push(this.traverseIntoUnit(part));
      } else if (coalesced.length > 0) {
        const last = coalesced[coalesced.length - 1];
        if (
          matchesAlgType(last, "move") &&
          this.sameBlock(last as Move, part as Move)
        ) {
          // TODO: This is cube-specific. Perhaps pass the modules as DataDown?
          const amount = (last as Move).amount + (part as Move).amount;
          coalesced.pop();
          if (amount !== 0) {
            // We could modify the last element instead of creating a new one,
            // but this is safe against shifting coding practices.
            // TODO: Figure out if the shoot-in-the-foot risk
            // modification is worth the speed.
            coalesced.push(
              new Move(
                (part as Move).outerLayer,
                (part as Move).innerLayer,
                (part as Move).family,
                amount,
              ),
            );
          }
        } else {
          coalesced.push(part);
        }
      } else {
        coalesced.push(part);
      }
    }
    return new Alg(coalesced);
  }

  public traverseBunch(bunch: Bunch): Unit {
    return bunch;
  }

  public traverseMove(move: Move): Unit {
    return move;
  }

  public traverseCommutator(commutator: Commutator): Unit {
    return commutator;
  }

  public traverseConjugate(conjugate: Conjugate): Unit {
    return conjugate;
  }

  public traversePause(pause: Pause): Unit {
    return pause;
  }

  public traverseNewline(newline: Newline): Unit {
    return newline;
  }

  public traverseComment(comment: Comment): Unit {
    return comment;
  }

  private sameBlock(moveA: Move, moveB: Move): boolean {
    // TODO: Handle layers
    return (
      moveA.outerLayer === moveB.outerLayer &&
      moveA.innerLayer === moveB.innerLayer &&
      moveA.family === moveB.family
    );
  }
}

// export class Concat extends TraversalDownUp<Algorithm, Alg> {
//   private concatIntoAlg(A: Unit[], B: Algorithm): Alg {
//     var nestedAlgs: Unit[] = A.slice();
//     if (matchesAlgType(B, "alg")) {
//       nestedAlgs = nestedAlgs.concat((B as unknown as Alg).nestedUnits)
//     } else {
//       nestedAlgs.push(B as unknown as Unit);
//     }
//     return new Alg(nestedAlgs)
//   }
//   public traverseAlg(     alg:     Alg,     dataDown: Algorithm): Alg {return this.concatIntoAlg(alg.nestedUnits, dataDown); }
//   public traverseBunch(        bunch:        Bunch,        dataDown: Algorithm): Alg {return this.concatIntoAlg([bunch]          , dataDown); }
//   public traverseMove(    Move:    Move,    dataDown: Algorithm): Alg {return this.concatIntoAlg([Move]      , dataDown); }
//   public traverseCommutator(   commutator:   Commutator,   dataDown: Algorithm): Alg {return this.concatIntoAlg([commutator]     , dataDown); }
//   public traverseConjugate(    conjugate:    Conjugate,    dataDown: Algorithm): Alg {return this.concatIntoAlg([conjugate]      , dataDown); }
//   public traversePause(        pause:        Pause,        dataDown: Algorithm): Alg {return this.concatIntoAlg([pause]          , dataDown); }
//   public traverseNewline(      newline:      Newline,      dataDown: Algorithm): Alg {return this.concatIntoAlg([newline]        , dataDown); }
//   public traverseComment( comment: Comment, dataDown: Algorithm): Alg {return this.concatIntoAlg([comment]   , dataDown); }
// }

function repetitionSuffix(amount: number): string {
  const absAmount = Math.abs(amount);
  let s = "";
  if (absAmount !== 1) {
    s += String(absAmount);
  }
  if (absAmount !== amount) {
    s += "'";
  }
  return s;
}
export function moveToString(move: Move): string {
  let out = move.family + repetitionSuffix(move.amount);
  if (typeof move.innerLayer !== "undefined") {
    out = String(move.innerLayer) + out;
    if (typeof move.outerLayer !== "undefined") {
      out = String(move.outerLayer) + "-" + out;
    }
  }
  return out;
}

export class ToString extends TraversalUp<string> {
  public traverseAlg(alg: Alg): string {
    let output = "";
    if (alg.nestedUnits.length > 0) {
      output += this.traverseUnit(alg.nestedUnits[0]);
      for (let i = 1; i < alg.nestedUnits.length; i++) {
        output += this.spaceBetween(alg.nestedUnits[i - 1], alg.nestedUnits[i]);
        output += this.traverseUnit(alg.nestedUnits[i]);
      }
    }
    return output;
  }

  public traverseBunch(bunch: Bunch): string {
    return (
      "(" +
      this.traverseUnit(bunch.nestedAlg) +
      ")" +
      repetitionSuffix(bunch.amount)
    );
  }

  public traverseMove(move: Move): string {
    return moveToString(move);
  }

  public traverseCommutator(commutator: Commutator): string {
    return (
      "[" +
      this.traverseUnit(commutator.A) +
      ", " +
      this.traverseUnit(commutator.B) +
      "]" +
      repetitionSuffix(commutator.amount)
    );
  }

  public traverseConjugate(conjugate: Conjugate): string {
    return (
      "[" +
      this.traverseUnit(conjugate.A) +
      ": " +
      this.traverseUnit(conjugate.B) +
      "]" +
      repetitionSuffix(conjugate.amount)
    );
  }

  // TODO: Remove spaces between repeated pauses (in traverseAlg)
  public traversePause(_pause: Pause): string {
    return ".";
  }

  public traverseNewline(_newline: Newline): string {
    return "\n";
  }

  // TODO: Enforce being followed by a newline (or the end of the alg)?
  public traverseComment(comment: Comment): string {
    return "//" + comment.comment;
  }

  // TODO: Sanitize `*/`
  private spaceBetween(u1: Unit, u2: Unit): string {
    if (matchesAlgType(u1, "pause") && matchesAlgType(u2, "pause")) {
      return "";
    }
    if (matchesAlgType(u1, "newline") || matchesAlgType(u2, "newline")) {
      return "";
    }
    if (matchesAlgType(u1, "comment") && !matchesAlgType(u2, "newline")) {
      return "\n";
    }
    return " ";
  }
}

const invertInstance = new Invert();
const expandInstance = new Expand();
const structureEqualsInstance = new StructureEquals();
const coalesceBaseMovesInstance = new CoalesceBaseMoves();
const algToStringInstance = new ToString();

export const invert = invertInstance.traverseAlg.bind(invertInstance) as (
  a: Alg,
) => Alg;
export const expand = expandInstance.traverseAlg.bind(expandInstance) as (
  a: Alg,
) => Alg;
export const structureEquals = structureEqualsInstance.traverseAlg.bind(
  structureEqualsInstance,
) as (a1: Alg, a2: Alg) => boolean;
export const coalesceBaseMoves = coalesceBaseMovesInstance.traverseAlg.bind(
  coalesceBaseMovesInstance,
) as (a: Alg) => Alg;
export const algToString = algToStringInstance.traverseAlg.bind(
  algToStringInstance,
) as (a: Alg) => string;

export const unitStructureEqualsForTesting = algToStringInstance.traverse.bind(
  algToStringInstance,
) as (a1: Unit, a2: Unit) => boolean;
export const unitToStringForTesting = algToStringInstance.traverse.bind(
  algToStringInstance,
) as (a: Unit) => string;

export function experimentalMoveQuantumName(move: Move): string {
  return unitToStringForTesting(
    new Move(move.outerLayer, move.innerLayer, move.family, 1),
  );
}
