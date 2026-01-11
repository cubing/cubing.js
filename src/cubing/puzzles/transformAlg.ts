import {
  Alg,
  type AlgNode,
  Commutator,
  Conjugate,
  functionFromTraversal,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalDownUp,
} from "../alg";
import type { AlgTransformData } from "./cubing-private";

class TransformAlg extends TraversalDownUp<
  AlgTransformData[string],
  Alg,
  AlgNode
> {
  public traverseAlg(alg: Alg, dataDown: AlgTransformData[string]): Alg {
    const algNodes: AlgNode[] = [];
    for (const algNode of alg.childAlgNodes()) {
      algNodes.push(this.traverseAlgNode(algNode, dataDown));
    }
    return new Alg(algNodes);
  }

  public traverseGrouping(
    grouping: Grouping,
    dataDown: AlgTransformData[string],
  ): AlgNode {
    return grouping.modified({ alg: this.traverseAlg(grouping.alg, dataDown) });
  }

  public traverseMove(move: Move, dataDown: AlgTransformData[string]): AlgNode {
    const invert = (() => {
      const { invertExceptByFamily } = dataDown;
      if (!invertExceptByFamily) {
        return false;
      }
      return !invertExceptByFamily.has(move.family);
    })();
    return move.modified({
      amount: invert ? -move.amount : move.amount,
      family: dataDown.replaceMovesByFamily[move.family] ?? move.family,
    });
  }

  public traverseCommutator(
    commutator: Commutator,
    dataDown: AlgTransformData[string],
  ): AlgNode {
    return new Commutator(
      this.traverseAlg(commutator.A, dataDown),
      this.traverseAlg(commutator.B, dataDown),
    );
  }

  public traverseConjugate(
    conjugate: Conjugate,
    dataDown: AlgTransformData[string],
  ): AlgNode {
    return new Conjugate(
      this.traverseAlg(conjugate.A, dataDown),
      this.traverseAlg(conjugate.B, dataDown),
    );
  }

  // TODO: Remove spaces between repeated pauses (in traverseSequence)
  public traversePause(
    pause: Pause,
    _dataDown: AlgTransformData[string],
  ): AlgNode {
    return pause;
  }

  public traverseNewline(
    newLine: Newline,
    _dataDown: AlgTransformData[string],
  ): AlgNode {
    return newLine;
  }

  // TODO: Enforce being followed by a newline (or the end of the alg)?
  public traverseLineComment(
    comment: LineComment,
    _dataDown: AlgTransformData[string],
  ): AlgNode {
    return comment;
  }
}

export const transformAlg = functionFromTraversal(TransformAlg);
