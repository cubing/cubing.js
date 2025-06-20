import {
  Alg,
  type AlgNode,
  type Commutator,
  type Conjugate,
  type Grouping,
  type LineComment,
  type Move,
  type Newline,
  type Pause,
} from "../../../../../cubing/alg";
import {
  functionFromTraversal,
  TraversalUp,
} from "../../../../../cubing/alg/traversal";
import { cube3x3x3 } from "../../../../../cubing/puzzles";

// TODO: Test that inverses are bijections.
class RemoveAnnotations extends TraversalUp<Generator<AlgNode>> {
  // TODO: Handle
  public *traverseAlg(alg: Alg): Generator<AlgNode> {
    yield* alg.childAlgNodes();
  }

  public *traverseGrouping(grouping: Grouping): Generator<AlgNode> {
    yield grouping;
  }

  public *traverseMove(move: Move): Generator<AlgNode> {
    yield move;
  }

  public *traverseCommutator(commutator: Commutator): Generator<AlgNode> {
    yield commutator;
  }

  public *traverseConjugate(conjugate: Conjugate): Generator<AlgNode> {
    yield conjugate;
  }

  public *traversePause(_pause: Pause): Generator<AlgNode> {
    // Nothing!
  }

  public *traverseNewline(_newline: Newline): Generator<AlgNode> {
    // Nothing!
  }

  public *traverseLineComment(_comment: LineComment): Generator<AlgNode> {
    // Nothing!
  }
}

const removeAnnotations = functionFromTraversal(RemoveAnnotations);

export function normalize(alg: Alg): Alg {
  return new Alg(removeAnnotations(alg)).experimentalSimplify({
    cancel: {
      puzzleSpecificModWrap: "canonical-centered",
    },
    puzzleSpecificSimplifyOptions: cube3x3x3.puzzleSpecificSimplifyOptions,
  });
}
