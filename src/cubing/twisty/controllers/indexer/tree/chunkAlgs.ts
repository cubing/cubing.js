import {
  type Alg,
  AlgBuilder,
  type AlgNode,
  type Commutator,
  Conjugate,
  functionFromTraversal,
  Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
  TraversalUp,
} from "../../../../alg";

const MIN_CHUNKING_THRESHOLD = 16;

function chunkifyAlg(alg: Alg, chunkMaxLength: number): Alg {
  const mainAlgBuilder = new AlgBuilder();
  const chunkAlgBuilder = new AlgBuilder();
  for (const algNode of alg.childAlgNodes()) {
    chunkAlgBuilder.push(algNode);
    if (chunkAlgBuilder.experimentalNumAlgNodes() >= chunkMaxLength) {
      mainAlgBuilder.push(new Grouping(chunkAlgBuilder.toAlg()));
      chunkAlgBuilder.reset();
    }
  }
  mainAlgBuilder.push(new Grouping(chunkAlgBuilder.toAlg()));
  return mainAlgBuilder.toAlg();
}

class ChunkAlgs extends TraversalUp<Alg, AlgNode> {
  traverseAlg(alg: Alg): Alg {
    const algLength = alg.experimentalNumChildAlgNodes();
    if (algLength < MIN_CHUNKING_THRESHOLD) {
      return alg;
    }
    return chunkifyAlg(alg, Math.ceil(Math.sqrt(algLength)));
  }

  traverseGrouping(grouping: Grouping): AlgNode {
    return new Grouping(
      this.traverseAlg(grouping.alg),
      grouping.amount, // TODO
    );
  }

  traverseMove(move: Move): AlgNode {
    return move;
  }

  traverseCommutator(commutator: Commutator): AlgNode {
    return new Conjugate(
      this.traverseAlg(commutator.A),
      this.traverseAlg(commutator.B),
    );
  }

  traverseConjugate(conjugate: Conjugate): AlgNode {
    return new Conjugate(
      this.traverseAlg(conjugate.A),
      this.traverseAlg(conjugate.B),
    );
  }

  traversePause(pause: Pause): AlgNode {
    return pause;
  }

  traverseNewline(newline: Newline): AlgNode {
    return newline;
  }

  traverseLineComment(comment: LineComment): AlgNode {
    return comment;
  }
}

export const chunkAlgs = functionFromTraversal(ChunkAlgs);
