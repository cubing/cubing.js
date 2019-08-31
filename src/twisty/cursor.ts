import {
  AlgPart,
  BlockMove,
  CommentLong,
  CommentShort,
  Commutator,
  Conjugate,
  expand,
  Group,
  NewLine,
  Pause,
  Sequence,
  TraversalUp,
} from "../alg";
import { Puzzle, State } from "./puzzle";

// TODO: Include Pause.
class CountAnimatedMoves extends TraversalUp<number> {
  public traverseSequence(sequence: Sequence): number {
    let total = 0;
    for (const part of sequence.nestedUnits) {
      total += this.traverse(part);
    }
    return total;
  }
  public traverseGroup(group: Group): number {
    return this.traverseSequence(group.nestedSequence);
  }
  public traverseBlockMove(blockMove: BlockMove): number {
    return 1;
  }
  public traverseCommutator(commutator: Commutator): number {
    return 2 * (this.traverseSequence(commutator.A) + this.traverseSequence(commutator.B));
  }
  public traverseConjugate(conjugate: Conjugate): number {
    return 2 * (this.traverseSequence(conjugate.A)) + this.traverseSequence(conjugate.B);
  }
  public traversePause(pause: Pause): number { return 0; }
  public traverseNewLine(newLine: NewLine): number { return 0; }
  public traverseCommentShort(commentShort: CommentShort): number { return 0; }
  public traverseCommentLong(commentLong: CommentLong): number { return 0; }
}

interface AlgorithmIndexer<P extends Puzzle> {
  getMove(index: number): BlockMove;
  indexToMoveStartTimestamp(index: number): Cursor.Timestamp;
  stateAtIndex(index: number): State<P>;
  numMoves(): number;
  timestampToIndex(timestamp: Cursor.Timestamp): number;
  algDuration(): Cursor.Duration;
}

class SimpleAlgorithmIndexer<P extends Puzzle> implements AlgorithmIndexer<P> {
  private moves: Sequence;
  // TODO: Allow custom `durationFn`.
  private durationFn: TraversalUp<Cursor.Duration> = new Cursor.AlgDuration(Cursor.DefaultDurationForAmount);
  constructor(private puzzle: P, alg: Sequence) {
    const moves = expand(alg);
    if (moves.type === "sequence") {
      this.moves = moves;
    } else {
      this.moves = new Sequence([moves]);
    }

    if (this.moves.nestedUnits.length === 0) {
      throw new Error("empty alg");
    }
    // TODO: Avoid assuming all base moves are block moves.
  }
  public getMove(index: number): BlockMove {
    return this.moves.nestedUnits[index] as BlockMove;
  }

  public indexToMoveStartTimestamp(index: number): Cursor.Timestamp {
    const seq = new Sequence(this.moves.nestedUnits.slice(0, index));
    return this.durationFn.traverse(seq);
  }

  public timestampToIndex(timestamp: Cursor.Timestamp): number {
    let cumulativeTime = 0;
    let i;
    for (i = 0; i < this.numMoves(); i++) {
      cumulativeTime += this.durationFn.traverseBlockMove(this.getMove(i));
      if (cumulativeTime >= timestamp) {
        return i;
      }
    }
    return i;
  }

  public stateAtIndex(index: number): State<P> {
    let state = this.puzzle.startState();
    for (const move of this.moves.nestedUnits.slice(0, index)) {
      state = this.puzzle.combine(state, this.puzzle.stateFromMove(move as BlockMove));
    }
    return state;
  }

  public algDuration(): Cursor.Duration {
    return this.durationFn.traverse(this.moves);
  }

  public numMoves(): number {
    // TODO: Cache internally once performance matters.
    return countAnimatedMoves(this.moves);
  }
}

const countAnimatedMovesInstance = new CountAnimatedMoves();
const countAnimatedMoves = countAnimatedMovesInstance.traverse.bind(countAnimatedMovesInstance);

export class Cursor<P extends Puzzle> {
  private indexer: AlgorithmIndexer<P>;
  private algTimestamp: Cursor.Duration;
  constructor(public alg: Sequence, private puzzle: P) {
    this.setMoves(alg);
    this.setPositionToStart();
  }

  public experimentalSetMoves(alg: Sequence): void {
    this.setMoves(alg);
  }

  public setPositionToStart(): void {
    this.algTimestamp = 0;
  }

  public setPositionToEnd(): void {
    this.setPositionToStart();
    this.forward(this.endOfAlg(), false);
  }

  public startOfAlg(): Cursor.Duration {
    return 0;
  }

  public endOfAlg(): Cursor.Duration {
    return this.indexer.algDuration();
  }

  public currentPosition(): Cursor.Position<P> {
    const moveIdx = this.indexer.timestampToIndex(this.algTimestamp);
    const pos = {
      state: this.indexer.stateAtIndex(moveIdx),
      moves: [],
    } as Cursor.Position<P>;
    const move = this.indexer.getMove(moveIdx);
    const moveTS = this.algTimestamp - this.indexer.indexToMoveStartTimestamp(moveIdx);
    const moveDuration = this.indexer.indexToMoveStartTimestamp(moveIdx + 1) - this.indexer.indexToMoveStartTimestamp(moveIdx);
    if (moveTS !== 0) {
      pos.moves.push({
        move,
        direction: Cursor.Direction.Forwards,
        // TODO: Expose a way to traverse `Unit`s directly?
        fraction: moveTS / moveDuration,
      });
    }
    return pos;
  }

  public currentTimestamp(): Cursor.Duration {
    return this.algTimestamp;
  }

  public delta(duration: Cursor.Duration, stopAtMoveBoundary: boolean): boolean {
    const moveIdx = this.indexer.timestampToIndex(this.algTimestamp);
    const unclampedNewTimestamp = this.algTimestamp + duration;
    const currentMoveStartTimestamp = this.indexer.indexToMoveStartTimestamp(moveIdx);
    if (stopAtMoveBoundary) {
      if (unclampedNewTimestamp < currentMoveStartTimestamp) {
        this.algTimestamp = currentMoveStartTimestamp;
        return true;
      }
      const nextMoveStartTimestamp = this.indexer.indexToMoveStartTimestamp(moveIdx + 1);
      if (unclampedNewTimestamp > nextMoveStartTimestamp) {
        this.algTimestamp = nextMoveStartTimestamp;
        return true;
      }
    }

    this.algTimestamp = Math.max(0, Math.min(this.indexer.algDuration(), unclampedNewTimestamp));
    return false;
  }

  private setMoves(alg: Sequence): void {
    const moves = expand(alg);
    if (moves.type === "sequence") {
      this.moves = moves;
    } else {
      this.moves = new Sequence([moves]);
    }

    // if (this.moves.nestedUnits.length === 0) {
    //   throw new Error("empty alg");
    // }
    // TODO: Avoid assuming all base moves are block moves.
  }

  // TODO: Avoid assuming a single move at a time.
  public forward(duration: Cursor.Duration, stopAtEndOfMove: boolean): /* TODO: Remove this. Represents if move breakpoint was reached. */ boolean {
    return this.delta(duration, stopAtEndOfMove);
  }

  public backward(duration: Cursor.Duration, stopAtStartOfMove: boolean): /* TODO: Remove this. Represents of move breakpoint was reached. */ boolean {
    return this.delta(duration, stopAtStartOfMove);
  }

  private setMoves(alg: Sequence): void {
    this.indexer = new SimpleAlgorithmIndexer(this.puzzle, alg);
  }
}

// tslint:disable-next-line no-namespace // TODO: nested module
export namespace Cursor {
  export type Duration = number; // Duration in milliseconds
  // TODO: Extend `number`, introduce MoveSequenceTimestamp vs. EpochTimestamp,
  // force Duration to be a difference.
  export type Timestamp = Duration; // Duration since a particular epoch.

  export type Fraction = number; // Value from 0 to 1.

  export enum Direction {
    Forwards = 1,
    Paused = 0,
    Backwards = -1,
  }

  export interface MoveProgress {
    move: AlgPart;
    direction: Direction;
    fraction: number;
  }

  export interface Position<P extends Puzzle> {
    state: State<P>;
    moves: MoveProgress[];
  }

  export enum BreakpointType {
    Move,
    EntireMoveSequence,
  }

  export type DurationForAmount = (amount: number) => Duration;

  export function ConstantDurationForAmount(amount: number): Duration {
    return 1000;
  }

  export function DefaultDurationForAmount(amount: number): Duration {
    switch (Math.abs(amount)) {
      case 0:
        return 0;
      case 1:
        return 1000;
      case 2:
        return 1500;
      default:
        return 2000;
    }
  }

  export class AlgDuration extends TraversalUp<Duration> {
    // TODO: Pass durationForAmount as Down type instead?
    constructor(public durationForAmount: (amount: number) => Duration = DefaultDurationForAmount) {
      super();
    }

    public traverseSequence(sequence: Sequence): Duration {
      let total = 0;
      for (const alg of sequence.nestedUnits) {
        total += this.traverse(alg);
      }
      return total;
    }
    public traverseGroup(group: Group): Duration { return group.amount * this.traverse(group.nestedSequence); }
    public traverseBlockMove(blockMove: BlockMove): Duration { return this.durationForAmount(blockMove.amount); }
    public traverseCommutator(commutator: Commutator): Duration { return commutator.amount * 2 * (this.traverse(commutator.A) + this.traverse(commutator.B)); }
    public traverseConjugate(conjugate: Conjugate): Duration { return conjugate.amount * (2 * this.traverse(conjugate.A) + this.traverse(conjugate.B)); }
    public traversePause(pause: Pause): Duration { return this.durationForAmount(1); }
    public traverseNewLine(newLine: NewLine): Duration { return this.durationForAmount(1); }
    public traverseCommentShort(commentShort: CommentShort): Duration { return this.durationForAmount(0); }
    public traverseCommentLong(commentLong: CommentLong): Duration { return this.durationForAmount(0); }
  }
}

// var c = new Cursor(Example.APermCompact);
// console.log(c.currentPosition());
// c.forward(4321, false);
// console.log(c.currentPosition());
// c.forward(2000, false);
// console.log(c.currentPosition());
// c.backward(100, false);
// console.log(c.currentPosition());
// c.backward(1800, false);
// console.log(c.currentPosition());
// c.forward(605, false);
// console.log(c.currentPosition());
// c.forward(10000, true);
// console.log(c.currentPosition());

// abstract class Position<AlgType extends Algorithm> {
//   Alg: AlgType;
//   Direction: Timeline.Direction;
//   TimeToSubAlg: Timeline.Duration;
//   SubAlg: Algorithm | null;
// }
