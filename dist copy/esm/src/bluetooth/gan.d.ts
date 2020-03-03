/// <reference types="web-bluetooth" />
import { BluetoothConfig, BluetoothPuzzle, PuzzleState } from "./bluetooth-puzzle";
export declare const ganConfig: BluetoothConfig;
export declare class GanCube extends BluetoothPuzzle {
    private service;
    private server;
    private physicalStateCharacteristic;
    private lastMoveCounter;
    private macAddress;
    static connect(server: BluetoothRemoteGATTServer): Promise<GanCube>;
    INTERVAL_MS: number;
    private intervalHandle;
    private kpuzzle;
    private cachedFaceletStatus1Characteristic;
    private cachedFaceletStatus2Characteristic;
    private cachedActualAngleAndBatteryCharacteristic;
    private constructor();
    name(): string | undefined;
    startTrackingMoves(): void;
    stopTrackingMoves(): void;
    intervalHandler(): Promise<void>;
    getBattery(): Promise<number>;
    getState(): Promise<PuzzleState>;
    faceletStatus1Characteristic(): Promise<BluetoothRemoteGATTCharacteristic>;
    faceletStatus2Characteristic(): Promise<BluetoothRemoteGATTCharacteristic>;
    actualAngleAndBatteryCharacteristic(): Promise<BluetoothRemoteGATTCharacteristic>;
    reset(): Promise<void>;
    readFaceletStatus1Characteristic(): Promise<ArrayBuffer>;
    readFaceletStatus2Characteristic(): Promise<string>;
    readActualAngleAndBatteryCharacteristic(): Promise<ArrayBuffer>;
}
//# sourceMappingURL=gan.d.ts.map