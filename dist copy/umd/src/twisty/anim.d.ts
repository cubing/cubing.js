import { Cursor } from "./cursor";
import { Puzzle } from "./puzzle";
export interface CursorObserver {
    animCursorChanged: (cursor: Cursor<Puzzle>) => void;
}
export interface DirectionObserver {
    animDirectionChanged: (direction: Cursor.Direction) => void;
}
export interface JumpObserver {
    animCursorJumped: () => void;
}
export declare class Dispatcher implements CursorObserver, DirectionObserver {
    private cursorObservers;
    private directionObservers;
    private jumpObservers;
    registerCursorObserver(observer: CursorObserver): void;
    registerDirectionObserver(observer: DirectionObserver): void;
    registerJumpObserver(observer: JumpObserver): void;
    animCursorChanged(cursor: Cursor<Puzzle>): void;
    animDirectionChanged(direction: Cursor.Direction): void;
    animCursorJumped(): void;
}
export declare class AnimModel {
    cursor: Cursor<Puzzle>;
    dispatcher: Dispatcher;
    private lastCursorTime;
    private direction;
    private breakpointType;
    private scheduler;
    private tempo;
    constructor(cursor: Cursor<Puzzle>);
    experimentalGetScheduler(): FrameScheduler;
    getBounds(): Cursor.Duration[];
    isPaused(): boolean;
    skipAndPauseTo(duration: Cursor.Duration): void;
    playForward(): void;
    pause(): void;
    playBackward(): void;
    skipToStart(): void;
    skipToEnd(): void;
    isAtEnd(): boolean;
    stepForward(): void;
    stepBackward(): void;
    togglePausePlayForward(): void;
    private timeScaling;
    private updateCursor;
    private setDirection;
    private frame;
    private setBreakpointType;
    private animateDirection;
}
declare class FrameScheduler {
    private callback;
    private animating;
    private lastRenderTimestamp;
    constructor(callback: (timestamp: Cursor.Timestamp) => void);
    animFrame(timestamp: Cursor.Timestamp): void;
    start(): void;
    stop(): void;
    singleFrame(): void;
}
export {};
//# sourceMappingURL=anim.d.ts.map