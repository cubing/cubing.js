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
} from "../../../../alg";
import { AlgBuilder } from "../../../../alg";

const MIN_CHUNKING_THRESHOLD = 16;

function chunkifyAlg(alg: Alg, chunkMaxLength: number): Alg {
  const mainAlgBuilder = new AlgBuilder();
  const chunkAlgBuilder = new AlgBuilder();
  for (const unit of alg.units()) {
    chunkAlgBuilder.push(unit);
    if (chunkAlgBuilder.experimentalNumUnits() >= chunkMaxLength) {
      mainAlgBuilder.push(new Grouping(chunkAlgBuilder.toAlg()));
      chunkAlgBuilder.reset();
    }
  }
  mainAlgBuilder.push(new Grouping(chunkAlgBuilder.toAlg()));
  return mainAlgBuilder.toAlg();
}

class ChunkAlgs extends TraversalUp<Alg, Unit> {
  traverseAlg(alg: Alg): Alg {
    const algLength = alg.experimentalNumUnits();
    if (algLength < MIN_CHUNKING_THRESHOLD) {
      return alg;
    }
    return chunkifyAlg(alg, Math.ceil(Math.sqrt(algLength)));
  }

  traverseGrouping(grouping: Grouping): Unit {
    return new Grouping(
      this.traverseAlg(grouping.alg),
      grouping.amount, // TODO
    );
  }

  traverseMove(move: Move): Unit {
    return move;
  }

  traverseCommutator(commutator: Commutator): Unit {
    return new Conjugate(
      this.traverseAlg(commutator.A),
      this.traverseAlg(commutator.B),
    );
  }

  traverseConjugate(conjugate: Conjugate): Unit {
    return new Conjugate(
      this.traverseAlg(conjugate.A),
      this.traverseAlg(conjugate.B),
    );
  }

  traversePause(pause: Pause): Unit {
    return pause;
  }

  traverseNewline(newline: Newline): Unit {
    return newline;
  }

  traverseLineComment(comment: LineComment): Unit {
    return comment;
  }
}

const chunkAlgsInstance = new ChunkAlgs();
export const chunkAlgs = chunkAlgsInstance.traverseAlg.bind(
  chunkAlgsInstance,
) as (alg: Alg) => Alg;
