import {BlockMove} from "../alg";
import {Combine, EquivalentStates, Invert, KPuzzleDefinition, Puzzles, stateForBlockMove, Transformation} from "../kpuzzle";

export type MoveName = string;

export interface MoveProgress {
  blockMove: BlockMove;
  fraction: number;
}

// tslint:disable-next-line no-empty-interface
export interface State<T extends Puzzle> {}

export abstract class Puzzle {
  public abstract startState(): State<Puzzle>;
  public abstract invert(state: State<Puzzle>): State<Puzzle>;
  public abstract combine(s1: State<Puzzle>, s2: State<Puzzle>): State<Puzzle>;
  public multiply(state: State<Puzzle>, amount: number): State<Puzzle> {
    if (amount < 0) {
      return this.invert(this.multiply(state, -amount));
    }

    let newState = this.startState();
    while (amount > 0) {
       if (amount % 2 === 1) {
          newState = this.combine(newState, state) ;
       }
       amount = Math.floor(amount / 2) ;
       state = this.combine(state, state) ;
    }
    return newState;
  }
  public abstract stateFromMove(blockMove: BlockMove): State<Puzzle>;
  public abstract equivalent(s1: State<Puzzle>, s2: State<Puzzle>): boolean;
}

interface KSolvePuzzleState extends Transformation, State<KSolvePuzzle> {
}

export class KSolvePuzzle extends Puzzle {

  public static fromID(id: string): KSolvePuzzle {
    return new KSolvePuzzle(Puzzles[id]);
  }
  constructor(private definition: KPuzzleDefinition) {
    super();
  }

  public startState(): KSolvePuzzleState {
    return this.definition.startPieces;
  }
  public invert(state: KSolvePuzzleState): KSolvePuzzleState {
    return Invert(this.definition, state);
  }
  public combine(s1: KSolvePuzzleState, s2: KSolvePuzzleState): KSolvePuzzleState {
    return Combine(this.definition, s1, s2);
  }
  public stateFromMove(blockMove: BlockMove): KSolvePuzzleState {
    return stateForBlockMove(this.definition, blockMove);
  }
  public equivalent(s1: KSolvePuzzleState, s2: KSolvePuzzleState): boolean {
    return EquivalentStates(this.definition, s1, s2);
  }
}

class QTMCounterState implements State<QTMCounterPuzzle> {
  constructor(public value: number) {}
}

export class QTMCounterPuzzle extends Puzzle {
  public startState(): QTMCounterState {
    return new QTMCounterState(0);
  }
  public invert(state: QTMCounterState): QTMCounterState {
    return new QTMCounterState(-state.value);
  }
  public combine(s1: QTMCounterState, s2: QTMCounterState): QTMCounterState {
    return new QTMCounterState(s1.value + s2.value);
  }
  public stateFromMove(blockMove: BlockMove): QTMCounterState {
    return new QTMCounterState(Math.abs(blockMove.amount));
  }
  public equivalent(s1: QTMCounterState, s2: QTMCounterState): boolean {
    return s1.value === s2.value;
  }
}
