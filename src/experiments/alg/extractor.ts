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
} from "../../cubing/alg";

class Extractor extends TraversalUp<Generator<[string, Unit | Alg]>> {
  *traverseAlg(alg: Alg): Generator<[string, Unit | Alg]> {
    yield ["Alg", alg];
    for (const unit of alg.units()) {
      yield* this.traverseUnit(unit);
    }
  }

  *traverseGrouping(grouping: Grouping): Generator<[string, Unit | Alg]> {
    yield ["Grouping", grouping];
    yield* this.traverseAlg(grouping.alg);
  }

  *traverseMove(move: Move): Generator<[string, Unit | Alg]> {
    yield ["Move", move];
  }

  *traverseCommutator(commutator: Commutator): Generator<[string, Unit | Alg]> {
    yield ["Commutator", commutator];
    yield* this.traverseAlg(commutator.A);
    yield* this.traverseAlg(commutator.B);
  }

  *traverseConjugate(conjugate: Conjugate): Generator<[string, Unit | Alg]> {
    yield ["Conjugate", conjugate];
    yield* this.traverseAlg(conjugate.A);
    yield* this.traverseAlg(conjugate.B);
  }

  *traversePause(pause: Pause): Generator<[string, Unit | Alg]> {
    yield ["Pause", pause];
  }

  *traverseNewline(newline: Newline): Generator<[string, Unit | Alg]> {
    yield ["Newline", newline];
  }

  *traverseLineComment(comment: LineComment): Generator<[string, Unit | Alg]> {
    yield ["Comment", comment];
  }
}

const extractorInstance = new Extractor();
export const extract = extractorInstance.traverseAlg.bind(
  extractorInstance,
) as (alg: Alg) => Generator<[string, Unit | Alg]>;
