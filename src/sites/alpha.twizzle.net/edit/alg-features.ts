import {
  type Alg,
  type Commutator,
  type Conjugate,
  functionFromTraversal,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalDownUp,
} from "../../../cubing/alg";

const noAlgFeatures = {
  commutator: false,
  conjugate: false,
  caretNISS: false,
  square1: false,
} as const satisfies Record<string, false>;

type AlgFeatures = Record<keyof typeof noAlgFeatures, boolean>;

class UsesCaretNISSNotation extends TraversalDownUp<AlgFeatures, void> {
  public traverseAlg(alg: Alg, algFeatures: AlgFeatures): void {
    for (const node of alg.childAlgNodes()) {
      this.traverseAlgNode(node, algFeatures);
    }
  }
  public traverseGrouping(grouping: Grouping, algFeatures: AlgFeatures): void {
    algFeatures.caretNISS ||= !!grouping.experimentalNISSPlaceholder;
    algFeatures.square1 ||= !!grouping.experimentalAsSquare1Tuple();
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
  const algFeatures: AlgFeatures = { ...noAlgFeatures };
  algFeaturesVisitor(alg, algFeatures);
  return algFeatures;
}
