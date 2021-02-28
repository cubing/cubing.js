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
import { AlgBuilder } from "../../../../alg/AlgBuilder";
import { PuzzleWrapper, State } from "../../../3D/puzzles/KPuzzleWrapper";
import { Duration, Timestamp } from "../../cursor/CursorTypes";
import { AlgIndexer } from "../AlgIndexer";
import { AlgPartDecoration, AlgWalker, DecoratorConstructor } from "./walker";

class ChunkAlgs extends TraversalUp<Alg, Unit> {
  traverseAlg(alg: Alg): Alg {
    const chunkMaxLength = Math.floor(Math.sqrt(alg.experimentalNumUnits()));
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

  traverseGrouping(grouping: Grouping): Unit {
    return new Grouping(
      this.traverseAlg(grouping.experimentalAlg),
      grouping.experimentalEffectiveAmount, // TODO
    );
  }

  traverseMove(move: Move): Unit {
    return move;
  }

  traverseCommutator(commutator: Commutator): Unit {
    return new Conjugate(
      this.traverseAlg(commutator.A),
      this.traverseAlg(commutator.B),
      commutator.experimentalEffectiveAmount, // TODO
    );
  }

  traverseConjugate(conjugate: Conjugate): Unit {
    return new Conjugate(
      this.traverseAlg(conjugate.A),
      this.traverseAlg(conjugate.B),
      conjugate.experimentalEffectiveAmount, // TODO
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

export class TreeAlgIndexer implements AlgIndexer<PuzzleWrapper> {
  private decoration: AlgPartDecoration<PuzzleWrapper>;
  private walker: AlgWalker<PuzzleWrapper>;
  constructor(private puzzle: PuzzleWrapper, alg: Alg) {
    const deccon = new DecoratorConstructor<PuzzleWrapper>(this.puzzle);

    const chunkedAlg = chunkAlgs(alg);

    this.decoration = deccon.traverseAlg(chunkedAlg);
    this.walker = new AlgWalker<PuzzleWrapper>(
      this.puzzle,
      chunkedAlg,
      this.decoration,
    );
  }

  public getMove(index: number): Move | null {
    // FIXME need to support Pause
    if (this.walker.moveByIndex(index)) {
      if (!this.walker.move) {
        throw new Error("`this.walker.mv` missing");
      }
      const move = this.walker.move as Move;
      // TODO: this type of negation needs to be in alg
      if (this.walker.back) {
        return move.inverse();
      }
      return move;
    }
    return null;
  }

  public indexToMoveStartTimestamp(index: number): Timestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public indexToMovesInProgress(index: number): Timestamp {
    if (this.walker.moveByIndex(index) || this.walker.i === index) {
      return this.walker.dur;
    }
    throw new Error("Out of algorithm: index " + index);
  }

  public stateAtIndex(
    index: number,
    startTransformation?: State<PuzzleWrapper>,
  ): State<PuzzleWrapper> {
    this.walker.moveByIndex(index);
    return this.puzzle.combine(
      startTransformation ?? this.puzzle.startState(),
      this.walker.st,
    );
  }

  // TransformAtIndex does not reflect the start state; it only reflects
  // the change from the start state to the current move index.  If you
  // want the actual state, use stateAtIndex.
  public transformAtIndex(index: number): State<PuzzleWrapper> {
    this.walker.moveByIndex(index);
    return this.walker.st;
  }

  public numMoves(): number {
    return this.decoration.moveCount;
  }

  public timestampToIndex(timestamp: Timestamp): number {
    this.walker.moveByDuration(timestamp);
    return this.walker.i;
  }

  public algDuration(): Duration {
    return this.decoration.duration;
  }

  public moveDuration(index: number): number {
    this.walker.moveByIndex(index);
    return this.walker.moveDuration;
  }
}
