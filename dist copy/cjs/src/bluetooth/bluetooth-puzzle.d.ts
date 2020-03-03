/// <reference types="web-bluetooth" />
import { BlockMove } from "../alg";
import { Transformation } from "../kpuzzle";
import { StreamTransformer } from "./transformer";
/******** BluetoothPuzzle ********/
export declare type PuzzleState = Transformation;
export declare class MoveEvent {
    latestMove: BlockMove;
    timeStamp: number;
    debug?: object;
    state?: PuzzleState;
    quaternion?: any;
}
export declare class OrientationEvent {
    quaternion: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    timeStamp: number;
    debug?: object;
}
export interface BluetoothConfig {
    filters: BluetoothRequestDeviceFilter[];
    optionalServices: BluetoothServiceUUID[];
}
export declare abstract class BluetoothPuzzle {
    transformers: StreamTransformer[];
    protected listeners: Array<(e: MoveEvent) => void>;
    protected orientationListeners: Array<(e: OrientationEvent) => void>;
    abstract name(): string | undefined;
    getState(): Promise<PuzzleState>;
    addMoveListener(listener: (e: MoveEvent) => void): void;
    addOrientationListener(listener: (e: OrientationEvent) => void): void;
    experimentalAddBasicRotationTransformer(): void;
    protected dispatchMove(moveEvent: MoveEvent): void;
    protected dispatchOrientation(orientationEvent: OrientationEvent): void;
}
//# sourceMappingURL=bluetooth-puzzle.d.ts.map