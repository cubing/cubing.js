import {
  Alg,
  Commutator,
  Conjugate,
  functionFromTraversal,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalUp,
} from "../../../cubing/alg";

class UsesCaretNISSNotation extends TraversalUp<boolean> {
  public traverseAlg(alg: Alg): boolean {
    for (const node of alg.childAlgNodes()) {
      if (this.traverseAlgNode(node)) {
        return true;
      }
    }
    return false;
  }
  public traverseGrouping(grouping: Grouping): boolean {
    return (
      !!grouping.experimentalNISSPlaceholder || this.traverseAlg(grouping.alg)
    );
  }
  public traverseMove(_move: Move): boolean {
    return false;
  }
  public traverseCommutator(_commutator: Commutator): boolean {
    return false;
  }
  public traverseConjugate(_conjugate: Conjugate): boolean {
    return false;
  }
  public traversePause(_pause: Pause): boolean {
    return false;
  }
  public traverseNewline(_newline: Newline): boolean {
    return false;
  }
  public traverseLineComment(comment: LineComment): boolean {
    return false;
  }
}

export const usesCaretNISSNotation = functionFromTraversal(
  UsesCaretNISSNotation,
);
