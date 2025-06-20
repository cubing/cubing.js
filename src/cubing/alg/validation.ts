import type { Alg } from "./Alg";

import type {
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
} from "./alg-nodes";
import { functionFromTraversal, TraversalUp } from "./traversal";

export class ValidationError extends Error {}

export abstract class ValidatorTraversal extends TraversalUp<void> {}

// TODO: Export function instead?
export class FlatAlgValidator extends ValidatorTraversal {
  public traverseAlg(alg: Alg): void {
    // TODO: Handle newlines and comments correctly
    for (const algNode of alg.childAlgNodes()) {
      this.traverseAlgNode(algNode);
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

export const validateFlatAlg = functionFromTraversal(FlatAlgValidator);
