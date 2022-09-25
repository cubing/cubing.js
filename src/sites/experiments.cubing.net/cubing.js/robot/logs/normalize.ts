import type { SimplifyOptions } from "../../../../../cubing/alg";
import {
  Alg,
  AlgNode,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalDownUp,
} from "../../../../../cubing/alg";
import { cube3x3x3 } from "../../../../../cubing/puzzles";

// TODO: Test that inverses are bijections.
class RemoveAnnotations extends TraversalDownUp<
  SimplifyOptions,
  Generator<AlgNode>
> {
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
    {
      yield conjugate;
    }
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

const removeAnnotationsInstance = new RemoveAnnotations();
const removeAnnotations: (alg: Alg) => Generator<AlgNode> =
  removeAnnotationsInstance.traverseAlg.bind(removeAnnotationsInstance);

export function normalize(alg: Alg): Alg {
  return new Alg(removeAnnotations(alg)).simplify({
    cancel: {
      puzzleSpecificModWrap: "canonical-centered",
    },
    puzzleSpecific: cube3x3x3.puzzleSpecificSimplifyOptions,
  });
}
