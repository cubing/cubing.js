/// <reference types="web-bluetooth" />
import { Sequence } from "../alg";
import { BluetoothConfig, BluetoothPuzzle } from "./bluetooth-puzzle";
export declare const goCubeConfig: BluetoothConfig;
export declare class GoCube extends BluetoothPuzzle {
    private server;
    goCubeStateCharacteristic: BluetoothRemoteGATTCharacteristic;
    static connect(server: BluetoothRemoteGATTServer): Promise<GoCube>;
    private recorded;
    private homeQuatInverse;
    private lastRawQuat;
    private currentQuat;
    private lastTarget;
    private alg;
    private constructor();
    reset(): void;
    resetAlg(algo?: Sequence): void;
    resetOrientation(): void;
    name(): string | undefined;
    private onCubeCharacteristicChanged;
}
//# sourceMappingURL=gocube.d.ts.map