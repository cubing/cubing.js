import { AlgPart, BlockMove, CommentLong, CommentShort, Commutator, Conjugate, Group, NewLine, Pause, Sequence, TraversalUp } from "../alg";
import { Puzzle, State } from "./puzzle";
interface AlgorithmIndexer<P extends Puzzle> {
    getMove(index: number): BlockMove;
    indexToMoveStartTimestamp(index: number): Cursor.Timestamp;
    stateAtIndex(index: number): State<P>;
    transformAtIndex(index: number): State<P>;
    numMoves(): number;
    timestampToIndex(timestamp: Cursor.Timestamp): number;
    algDuration(): Cursor.Duration;
    moveDuration(index: number): number;
}
export declare function invertBlockMove(bm: BlockMove): BlockMove;
export declare class TreeAlgorithmIndexer<P extends Puzzle> implements AlgorithmIndexer<P> {
    private puzzle;
    private decoration;
    private walker;
    constructor(puzzle: P, alg: Sequence);
    getMove(index: number): BlockMove;
    indexToMoveStartTimestamp(index: number): Cursor.Timestamp;
    stateAtIndex(index: number): State<P>;
    transformAtIndex(index: number): State<P>;
    numMoves(): number;
    timestampToIndex(timestamp: Cursor.Timestamp): number;
    algDuration(): Cursor.Duration;
    moveDuration(index: number): number;
}
export declare class Cursor<P extends Puzzle> {
    alg: Sequence;
    private puzzle;
    private indexer;
    private algTimestamp;
    private lastMoveData?;
    constructor(alg: Sequence, puzzle: P);
    experimentalSetMoves(alg: Sequence): void;
    experimentalUpdateAlgAnimate(alg: Sequence, move: BlockMove): void;
    setPositionToStart(): void;
    setPositionToEnd(): void;
    startOfAlg(): Cursor.Duration;
    endOfAlg(): Cursor.Duration;
    currentPosition(): Cursor.Position<P>;
    currentTimestamp(): Cursor.Duration;
    delta(duration: Cursor.Duration, stopAtMoveBoundary: boolean): boolean;
    experimentalSetDurationScale(scale: number): void;
    forward(duration: Cursor.Duration, stopAtEndOfMove: boolean): boolean;
    backward(duration: Cursor.Duration, stopAtStartOfMove: boolean): boolean;
    private setMoves;
}
export declare namespace Cursor {
    type Duration = number;
    type Timestamp = Duration;
    type Fraction = number;
    enum Direction {
        Forwards = 1,
        Paused = 0,
        Backwards = -1
    }
    interface MoveProgress {
        move: AlgPart;
        direction: Direction;
        fraction: number;
    }
    interface Position<P extends Puzzle> {
        state: State<P>;
        moves: MoveProgress[];
    }
    enum BreakpointType {
        Move = 0,
        EntireMoveSequence = 1
    }
    type DurationForAmount = (amount: number) => Duration;
    function ConstantDurationForAmount(amount: number): Duration;
    function DefaultDurationForAmount(amount: number): Duration;
    function ExperimentalScaledDefaultDurationForAmount(scale: number, amount: number): Duration;
    class AlgDuration extends TraversalUp<Duration> {
        durationForAmount: (amount: number) => Duration;
        constructor(durationForAmount?: (amount: number) => Duration);
        traverseSequence(sequence: Sequence): Duration;
        traverseGroup(group: Group): Duration;
        traverseBlockMove(blockMove: BlockMove): Duration;
        traverseCommutator(commutator: Commutator): Duration;
        traverseConjugate(conjugate: Conjugate): Duration;
        traversePause(pause: Pause): Duration;
        traverseNewLine(newLine: NewLine): Duration;
        traverseCommentShort(commentShort: CommentShort): Duration;
        traverseCommentLong(commentLong: CommentLong): Duration;
    }
}
export {};
//# sourceMappingURL=cursor.d.ts.map