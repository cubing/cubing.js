import { KPuzzleDefinition } from "../kpuzzle";
import { StickerDat } from "../puzzle-geometry";
import { Cube3D } from "./3D/cube3D";
import { PG3D } from "./3D/pg3D";
import { AnimModel, CursorObserver, DirectionObserver, JumpObserver } from "./anim";
import { Cursor } from "./cursor";
import { Puzzle } from "./puzzle";
export declare type VisualizationFormat = "2D" | "3D" | "PG3D";
declare global {
    interface Document {
        mozCancelFullScreen: () => void;
        msExitFullscreen: () => void;
        mozFullScreenElement: HTMLElement;
        msFullscreenElement: HTMLElement;
        webkitFullscreenElement: HTMLElement;
    }
    interface Element {
        mozRequestFullScreen: () => void;
        msRequestFullscreen: () => void;
    }
}
export declare function currentFullscreenElement(): Element;
export declare function fullscreenRequest(element: HTMLElement): void;
export declare function fullscreenExit(): void;
export declare function experimentalShowJumpingFlash(show: boolean): void;
export declare abstract class Button {
    element: HTMLButtonElement;
    constructor(title: string, initialClass: string);
    abstract onpress(): void;
}
export declare namespace Button {
    class Fullscreen extends Button {
        private fullscreenElement;
        constructor(fullscreenElement: HTMLElement);
        onpress(): void;
    }
    class SkipToStart extends Button {
        private anim;
        constructor(anim: AnimModel);
        onpress(): void;
    }
    class SkipToEnd extends Button {
        private anim;
        constructor(anim: AnimModel);
        onpress(): void;
    }
    class PlayPause extends Button implements DirectionObserver {
        private anim;
        constructor(anim: AnimModel);
        onpress(): void;
        animDirectionChanged(direction: Cursor.Direction): void;
    }
    class StepForward extends Button {
        private anim;
        constructor(anim: AnimModel);
        onpress(): void;
    }
    class StepBackward extends Button {
        private anim;
        constructor(anim: AnimModel);
        onpress(): void;
    }
}
export declare class ControlBar {
    element: HTMLElement;
    constructor(anim: AnimModel, twistyElement: HTMLElement);
}
export declare class Scrubber implements CursorObserver {
    private anim;
    readonly element: HTMLInputElement;
    constructor(anim: AnimModel);
    updateFromAnim(): void;
    animCursorChanged(cursor: Cursor<Puzzle>): void;
    animBoundsChanged(): void;
    private updateBackground;
    private oninput;
}
export declare class CursorTextView implements CursorObserver {
    private anim;
    readonly element: HTMLElement;
    constructor(anim: AnimModel);
    animCursorChanged(cursor: Cursor<Puzzle>): void;
}
export declare class CursorTextMoveView implements CursorObserver {
    private anim;
    readonly element: HTMLElement;
    constructor(anim: AnimModel);
    animCursorChanged(cursor: Cursor<Puzzle>): void;
    private formatFraction;
}
export declare class KSolveView implements CursorObserver, JumpObserver {
    private anim;
    private definition;
    readonly element: HTMLElement;
    private svg;
    constructor(anim: AnimModel, definition: KPuzzleDefinition);
    animCursorChanged(cursor: Cursor<Puzzle>): void;
    animCursorJumped(): void;
}
interface Cube3DViewConfig {
    experimentalShowBackView?: boolean;
}
export declare class Cube3DView implements CursorObserver, JumpObserver {
    private anim;
    private config;
    readonly element: HTMLElement;
    private cube3D;
    constructor(anim: AnimModel, definition: KPuzzleDefinition, config?: Cube3DViewConfig);
    createBackViewForTesting(): void;
    animCursorChanged(cursor: Cursor<Puzzle>): void;
    animCursorJumped(): void;
    experimentalGetCube3D(): Cube3D;
}
interface PG3DViewConfig {
    stickerDat: StickerDat;
    experimentalPolarVantages?: boolean;
    sideBySide?: boolean;
    showFoundation?: boolean;
}
export declare class PG3DView implements CursorObserver, JumpObserver {
    private anim;
    private definition;
    private config;
    readonly element: HTMLElement;
    private pg3D;
    constructor(anim: AnimModel, definition: KPuzzleDefinition, config: PG3DViewConfig);
    animCursorChanged(cursor: Cursor<Puzzle>): void;
    animCursorJumped(): void;
    experimentalGetPG3D(): PG3D;
    private createBackViewForTesting;
}
export interface PlayerConfig {
    visualizationFormat?: VisualizationFormat;
    experimentalShowControls?: boolean;
    experimentalCube3DViewConfig?: Cube3DViewConfig;
    experimentalPG3DViewConfig?: PG3DViewConfig;
}
export declare class Player {
    private anim;
    private config;
    element: HTMLElement;
    cube3DView: Cube3DView;
    pg3DView: PG3DView;
    private scrubber;
    constructor(anim: AnimModel, definition: KPuzzleDefinition, config?: PlayerConfig);
    updateFromAnim(): void;
}
export {};
//# sourceMappingURL=widget.d.ts.map