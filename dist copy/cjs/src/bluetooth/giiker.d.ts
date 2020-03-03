/// <reference types="web-bluetooth" />
import { BlockMove } from "../alg";
import { BluetoothConfig, BluetoothPuzzle, PuzzleState } from "./bluetooth-puzzle";
export declare const giiKERConfig: BluetoothConfig;
declare function giikerMoveToBlockMove(face: number, amount: number): BlockMove;
export { giikerMoveToBlockMove as giikerMoveToBlockMoveForTesting };
export declare class GiiKERCube extends BluetoothPuzzle {
    private server;
    private cubeCharacteristic;
    private originalValue?;
    static connect(server: BluetoothRemoteGATTServer): Promise<GiiKERCube>;
    private constructor();
    name(): string | undefined;
    getState(): Promise<PuzzleState>;
    private getBit;
    private toReid333;
    private onCubeCharacteristicChanged;
    private isRepeatedInitialValue;
}
//# sourceMappingURL=giiker.d.ts.map