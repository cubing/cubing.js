import { PerspectiveCamera, Renderer, Scene, Vector3, WebGLRenderer } from "three";
import { Cursor } from "../cursor";
import { Puzzle } from "../puzzle";
export declare const TAU: number;
export declare class Vantage {
    element: HTMLElement;
    private scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    private rafID;
    private stats;
    private shift;
    constructor(element: HTMLElement, scene: Scene, options?: VantageOptions);
    resize(): void;
    render(): void;
    private scheduledResize;
}
export interface VantageOptions {
    position?: Vector3;
    renderer?: Renderer;
    shift?: number;
}
export declare abstract class Twisty3D<P extends Puzzle> {
    protected scene: Scene;
    protected vantages: Vantage[];
    constructor();
    newVantage(element: HTMLElement, options?: VantageOptions): Vantage;
    draw(p: Cursor.Position<P>): void;
    experimentalGetScene(): Scene;
    experimentalGetVantages(): Vantage[];
    protected abstract updateScene(p: Cursor.Position<P>): void;
}
//# sourceMappingURL=twisty3D.d.ts.map