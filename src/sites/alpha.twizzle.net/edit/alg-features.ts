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
  TraversalDownUp,
} from "../../../cubing/alg";

interface AlgFeatures {
  commutator: boolean;
  conjugate: boolean;
  caretNISS: boolean;
}
class UsesCaretNISSNotation extends TraversalDownUp<AlgFeatures, void> {
  public traverseAlg(alg: Alg, algFeatures: AlgFeatures): void {
    for (const node of alg.childAlgNodes()) {
      this.traverseAlgNode(node, algFeatures);
    }
  }
  public traverseGrouping(grouping: Grouping, algFeatures: AlgFeatures): void {
    algFeatures.caretNISS ||= !!grouping.experimentalNISSPlaceholder;
    this.traverseAlg(grouping.alg, algFeatures);
  }
  public traverseMove(_move: Move, _algFeatures: AlgFeatures): void {}
  public traverseCommutator(
    commutator: Commutator,
    algFeatures: AlgFeatures,
  ): void {
    algFeatures.commutator = true;
    this.traverseAlg(commutator.A, algFeatures);
    this.traverseAlg(commutator.B, algFeatures);
  }
  public traverseConjugate(
    conjugate: Conjugate,
    algFeatures: AlgFeatures,
  ): void {
    algFeatures.conjugate = true;
    this.traverseAlg(conjugate.A, algFeatures);
    this.traverseAlg(conjugate.B, algFeatures);
  }
  public traversePause(_pause: Pause, _algFeatures: AlgFeatures): void {}
  public traverseNewline(_newline: Newline, _algFeatures: AlgFeatures): void {}
  public traverseLineComment(
    _comment: LineComment,
    _algFeatures: AlgFeatures,
  ): void {}
}

const algFeaturesVisitor = functionFromTraversal(UsesCaretNISSNotation);

export function computeAlgFeatures(alg: Alg): AlgFeatures {
  const algFeatures: AlgFeatures = {
    commutator: false,
    conjugate: false,
    caretNISS: false,
  };
  algFeaturesVisitor(alg, algFeatures);
  return algFeatures;
}
