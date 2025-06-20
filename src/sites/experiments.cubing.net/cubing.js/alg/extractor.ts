import {
  type Alg,
  type AlgNode,
  type Commutator,
  type Conjugate,
  functionFromTraversal,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalUp,
} from "../../../../cubing/alg";

class Extractor extends TraversalUp<Generator<[string, AlgNode | Alg]>> {
  *traverseAlg(alg: Alg): Generator<[string, AlgNode | Alg]> {
    yield ["Alg", alg];
    for (const algNode of alg.childAlgNodes()) {
      yield* this.traverseAlgNode(algNode);
    }
  }

  *traverseGrouping(grouping: Grouping): Generator<[string, AlgNode | Alg]> {
    yield ["Grouping", grouping];
    yield* this.traverseAlg(grouping.alg);
  }

  *traverseMove(move: Move): Generator<[string, AlgNode | Alg]> {
    yield ["Move", move];
  }

  *traverseCommutator(
    commutator: Commutator,
  ): Generator<[string, AlgNode | Alg]> {
    yield ["Commutator", commutator];
    yield* this.traverseAlg(commutator.A);
    yield* this.traverseAlg(commutator.B);
  }

  *traverseConjugate(conjugate: Conjugate): Generator<[string, AlgNode | Alg]> {
    yield ["Conjugate", conjugate];
    yield* this.traverseAlg(conjugate.A);
    yield* this.traverseAlg(conjugate.B);
  }

  *traversePause(pause: Pause): Generator<[string, AlgNode | Alg]> {
    yield ["Pause", pause];
  }

  *traverseNewline(newline: Newline): Generator<[string, AlgNode | Alg]> {
    yield ["Newline", newline];
  }

  *traverseLineComment(
    comment: LineComment,
  ): Generator<[string, AlgNode | Alg]> {
    yield ["Comment", comment];
  }
}

export const extract = functionFromTraversal(Extractor);
