import {
  BlockMove,
  Comment,
  Commutator,
  Conjugate,
  Group,
  NewLine,
  Pause,
  Sequence,
} from "./algorithm";

import { TraversalUp } from "./traversal";

export class ValidationError extends Error { }

export abstract class ValidatorTraversal extends TraversalUp<void> { }

interface FamilyList { [s: string]: boolean; }

function validateFamily(family: string, allowedFamilyLists: FamilyList[]): boolean {
  for (const list of allowedFamilyLists) {
    if (list[family] === true) {
      return true;
    }
  }
  return false;
}

// TODO: Switch to `Set`?
const plainMoveFamilies: FamilyList = {
  x: true,
  y: true,
  z: true,
  M: true,
  E: true,
  S: true,
  m: true,
  e: true,
  s: true,
};

const singleSliceMoveFamilies: FamilyList = {
  U: true,
  L: true,
  F: true,
  R: true,
  B: true,
  D: true,
};

const wideMoveFamilies: FamilyList = {
  u: true,
  l: true,
  f: true,
  r: true,
  b: true,
  d: true,
  Uw: true,
  Lw: true,
  Fw: true,
  Rw: true,
  Bw: true,
  Dw: true,
};

abstract class BaseMoveValidator extends ValidatorTraversal {
  public traverseSequence(sequence: Sequence): void {
    // TODO: Handle newLines and comments correctly
    for (const unit of sequence.nestedUnits) {
      this.traverse(unit);
    }
  }
  public traverseGroup(group: Group): void {
    return this.traverse(group.nestedSequence);
  }
  public traverseCommutator(commutator: Commutator): void {
    this.traverse(commutator.A);
    this.traverse(commutator.B);
  }
  public traverseConjugate(conjugate: Conjugate): void {
    this.traverse(conjugate.A);
    this.traverse(conjugate.B);
  }
  public traversePause(pause: Pause): void { return; }
  public traverseNewLine(newLine: NewLine): void { return; }
  public traverseComment(comment: Comment): void { return; }
}

// TODO: Export function instead?
export class BlockMoveValidator extends BaseMoveValidator {
  public traverseBlockMove(blockMove: BlockMove): void {
    if (typeof blockMove.outerLayer !== "undefined") {
      if (typeof blockMove.innerLayer === "undefined") {
        throw new ValidationError("A BlockMove with an outer layer must have an inner layer.");
      }
      if (!validateFamily(blockMove.family, [wideMoveFamilies])) {
        throw new ValidationError(`The provided SiGN move family is invalid, or cannot have an outer and inner layer: ${blockMove.family}`);
      }
      if (blockMove.outerLayer <= 0) {
        throw new ValidationError("Cannot have an outer layer of 0 or less.");
      }
      // TODO: Allow 2-2r?
      if (blockMove.outerLayer >= blockMove.innerLayer) {
        throw new ValidationError("The outer layer must be less than the inner layer.");
      }
      return;
    } else if (typeof blockMove.innerLayer !== "undefined") {
      if (!validateFamily(blockMove.family, [wideMoveFamilies, singleSliceMoveFamilies])) {
        throw new ValidationError(`The provided SiGN move family is invalid, or cannot have an inner slice: ${blockMove.family}`);
      }
      if (blockMove.innerLayer <= 0) {
        throw new ValidationError("Cannot have an inner layer of 0 or less.");
      }
      return;
    } else {
      if (!validateFamily(blockMove.family, [wideMoveFamilies, singleSliceMoveFamilies, plainMoveFamilies])) {
        throw new ValidationError(`Invalid SiGN plain move family: ${blockMove.family}`);
      }
      return;
    }
  }
}

// TODO: Export function instead?
export class FlatAlgValidator extends ValidatorTraversal {

  public traverseSequence(sequence: Sequence): void {
    // TODO: Handle newLines and comments correctly
    for (const unit of sequence.nestedUnits) {
      this.traverse(unit);
    }
    return;
  }
  public traverseGroup(group: Group): void {
    throw new ValidationError("A flat alg cannot contain a group.");
  }
  public traverseBlockMove(blockMove: BlockMove): void {
    return;
  }
  public traverseCommutator(commutator: Commutator): void {
    throw new ValidationError("A flat alg cannot contain a commutator.");
  }
  public traverseConjugate(conjugate: Conjugate): void {
    throw new ValidationError("A flat alg cannot contain a conjugate.");
  }
  public traversePause(pause: Pause): void { return; }
  public traverseNewLine(newLine: NewLine): void { return; }
  public traverseComment(comment: Comment): void { return; }
}

export type Validator = (a: Sequence) => void;

const BlockMoveValidatorInstance = new BlockMoveValidator();
export const validateSiGNMoves = BlockMoveValidatorInstance.traverse.bind(BlockMoveValidatorInstance) as Validator;

const flatAlgValidatorInstance = new FlatAlgValidator();
export const validateFlatAlg = flatAlgValidatorInstance.traverse.bind(flatAlgValidatorInstance) as Validator;

// TODO: Option for puzzle size?
export function validateSiGNAlg(a: Sequence): void {
  validateSiGNMoves(a);
  validateFlatAlg(a);
}
