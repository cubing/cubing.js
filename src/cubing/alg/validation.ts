import { Alg } from "./Alg";

import { TraversalUp } from "./traversal";
import {
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Turn,
  Newline,
  Pause,
} from "./units";

export class ValidationError extends Error {}

export abstract class ValidatorTraversal extends TraversalUp<void> {}

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

  public traverseTurn(_turn: Turn): void {
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

const flatAlgValidatorInstance = new FlatAlgValidator();
export const validateFlatAlg = flatAlgValidatorInstance.traverseAlg.bind(
  flatAlgValidatorInstance,
) as Validator;
