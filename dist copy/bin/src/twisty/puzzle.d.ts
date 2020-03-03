import { BlockMove } from "../alg";
import { KPuzzleDefinition, Transformation } from "../kpuzzle";
export declare type MoveName = string;
export interface MoveProgress {
    blockMove: BlockMove;
    fraction: number;
}
export interface State<T extends Puzzle> {
}
export declare abstract class Puzzle {
    abstract startState(): State<Puzzle>;
    abstract invert(state: State<Puzzle>): State<Puzzle>;
    abstract combine(s1: State<Puzzle>, s2: State<Puzzle>): State<Puzzle>;
    multiply(state: State<Puzzle>, amount: number): State<Puzzle>;
    abstract stateFromMove(blockMove: BlockMove): State<Puzzle>;
    abstract identity(): State<Puzzle>;
    abstract equivalent(s1: State<Puzzle>, s2: State<Puzzle>): boolean;
}
interface KSolvePuzzleState extends Transformation, State<KSolvePuzzle> {
}
export declare class KSolvePuzzle extends Puzzle {
    private definition;
    static fromID(id: string): KSolvePuzzle;
    moveStash: {
        [key: string]: Transformation;
    };
    constructor(definition: KPuzzleDefinition);
    startState(): KSolvePuzzleState;
    invert(state: KSolvePuzzleState): KSolvePuzzleState;
    combine(s1: KSolvePuzzleState, s2: KSolvePuzzleState): KSolvePuzzleState;
    stateFromMove(blockMove: BlockMove): KSolvePuzzleState;
    identity(): KSolvePuzzleState;
    equivalent(s1: KSolvePuzzleState, s2: KSolvePuzzleState): boolean;
}
declare class QTMCounterState implements State<QTMCounterPuzzle> {
    value: number;
    constructor(value: number);
}
export declare class QTMCounterPuzzle extends Puzzle {
    startState(): QTMCounterState;
    invert(state: QTMCounterState): QTMCounterState;
    combine(s1: QTMCounterState, s2: QTMCounterState): QTMCounterState;
    stateFromMove(blockMove: BlockMove): QTMCounterState;
    identity(): QTMCounterState;
    equivalent(s1: QTMCounterState, s2: QTMCounterState): boolean;
}
export {};
//# sourceMappingURL=puzzle.d.ts.map