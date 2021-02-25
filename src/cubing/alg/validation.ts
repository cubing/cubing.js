import { Alg } from "./Alg";

import { TraversalUp } from "./traversal";
import {
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
} from "./units";

export class ValidationError extends Error {}

export abstract class ValidatorTraversal extends TraversalUp<void> {}

interface FamilyList {
  [s: string]: boolean;
}

function validateFamily(
  family: string,
  allowedFamilyLists: FamilyList[],
): boolean {
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
  public traverseAlg(alg: Alg): void {
    // TODO: Handle newlines and comments correctly
    for (const unit of alg.units()) {
      this.traverseUnit(unit);
    }
  }

  public traverseGrouping(grouping: Grouping): void {
    return this.traverseAlg(grouping.experimentalAlg);
  }

  public traverseCommutator(commutator: Commutator): void {
    this.traverseAlg(commutator.A);
    this.traverseAlg(commutator.B);
  }

  public traverseConjugate(conjugate: Conjugate): void {
    this.traverseAlg(conjugate.A);
    this.traverseAlg(conjugate.B);
  }

  public traversePause(_pause: Pause): void {
    return;
  }

  public traverseNewline(_newline: Newline): void {
    return;
  }

  public traverseLineComment(_comment: LineComment): void {
    return;
  }
}

// TODO: Export function instead?
export class BlockMoveValidator extends BaseMoveValidator {
  public traverseMove(move: Move): void {
    if (typeof move.outerLayer !== "undefined") {
      if (typeof move.innerLayer === "undefined") {
        throw new ValidationError(
          "A BlockMove with an outer layer must have an inner layer.",
        );
      }
      if (!validateFamily(move.family, [wideMoveFamilies])) {
        throw new ValidationError(
          `The provided SiGN move family is invalid, or cannot have an outer and inner layer: ${move.family}`,
        );
      }
      if (move.outerLayer <= 0) {
        throw new ValidationError("Cannot have an outer layer of 0 or less.");
      }
      // TODO: Allow 2-2r?
      if (move.outerLayer >= move.innerLayer) {
        throw new ValidationError(
          "The outer layer must be less than the inner layer.",
        );
      }
      return;
    } else if (typeof move.innerLayer !== "undefined") {
      if (
        !validateFamily(move.family, [
          wideMoveFamilies,
          singleSliceMoveFamilies,
        ])
      ) {
        throw new ValidationError(
          `The provided SiGN move family is invalid, or cannot have an inner slice: ${move.family}`,
        );
      }
      if (move.innerLayer <= 0) {
        throw new ValidationError("Cannot have an inner layer of 0 or less.");
      }
      return;
    } else {
      if (
        !validateFamily(move.family, [
          wideMoveFamilies,
          singleSliceMoveFamilies,
          plainMoveFamilies,
        ])
      ) {
        throw new ValidationError(
          `Invalid SiGN plain move family: ${move.family}`,
        );
      }
      return;
    }
  }
}

// TODO: Export function instead?
export class FlatAlgValidator extends ValidatorTraversal {
  public traverseAlg(alg: Alg): void {
    // TODO: Handle newlines and comments correctly
    for (const unit of alg.units()) {
      this.traverseUnit(unit);
    }
    return;
  }

  public traverseGrouping(_grouping: Grouping): void {
    throw new ValidationError("A flat alg cannot contain a grouping.");
  }

  public traverseMove(_move: Move): void {
    return;
  }

  public traverseCommutator(_commutator: Commutator): void {
    throw new ValidationError("A flat alg cannot contain a commutator.");
  }

  public traverseConjugate(_conjugate: Conjugate): void {
    throw new ValidationError("A flat alg cannot contain a conjugate.");
  }

  public traversePause(_pause: Pause): void {
    return;
  }

  public traverseNewline(_newline: Newline): void {
    return;
  }

  public traverseLineComment(_comment: LineComment): void {
    return;
  }
}

export type Validator = (a: Alg) => void;

const BlockMoveValidatorInstance = new BlockMoveValidator();
export const validateSiGNMoves = BlockMoveValidatorInstance.traverseAlg.bind(
  BlockMoveValidatorInstance,
) as Validator;

const flatAlgValidatorInstance = new FlatAlgValidator();
export const validateFlatAlg = flatAlgValidatorInstance.traverseAlg.bind(
  flatAlgValidatorInstance,
) as Validator;

// TODO: Option for puzzle size?
export function validateSiGNAlg(a: Alg): void {
  validateSiGNMoves(a);
  validateFlatAlg(a);
}
