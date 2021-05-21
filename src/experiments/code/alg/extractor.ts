import {
  Alg,
  Commutator,
  Conjugate,
  Grouping,
  LineComment,
  Move,
  Newline,
  Pause,
  TraversalUp,
  Unit,
} from "../../../cubing/alg";

class Extractor extends TraversalUp<Generator<Unit | Alg>> {
  *traverseAlg(alg: Alg): Generator<Unit | Alg> {
    yield alg;
    for (const unit of alg.units()) {
      yield* this.traverseUnit(unit);
    }
  }

  *traverseGrouping(grouping: Grouping): Generator<Unit | Alg> {
    yield grouping;
    yield* this.traverseAlg(grouping.experimentalAlg);
  }

  *traverseMove(move: Move): Generator<Unit | Alg> {
    yield move;
  }

  *traverseCommutator(commutator: Commutator): Generator<Unit | Alg> {
    yield commutator;
    yield* this.traverseAlg(commutator.A);
    yield* this.traverseAlg(commutator.B);
  }

  *traverseConjugate(conjugate: Conjugate): Generator<Unit | Alg> {
    yield conjugate;
    yield* this.traverseAlg(conjugate.A);
    yield* this.traverseAlg(conjugate.B);
  }

  *traversePause(pause: Pause): Generator<Unit | Alg> {
    yield pause;
  }

  *traverseNewline(newline: Newline): Generator<Unit | Alg> {
    yield newline;
  }

  *traverseLineComment(comment: LineComment): Generator<Unit | Alg> {
    yield comment;
  }
}

const extractorInstance = new Extractor();
export const extract = extractorInstance.traverseAlg.bind(
  extractorInstance,
) as (alg: Alg) => Generator<Alg | Unit>;
