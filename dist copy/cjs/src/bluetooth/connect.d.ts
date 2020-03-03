/// <reference types="web-bluetooth" />
import { BluetoothPuzzle } from "./bluetooth-puzzle";
/******** requestOptions ********/
export interface BluetoothConfig {
    filters: BluetoothRequestDeviceFilter[];
    optionalServices: BluetoothServiceUUID[];
}
/******** connect() ********/
interface BluetoothConnectOptions {
    acceptAllDevices?: boolean;
}
export declare function connect(options?: BluetoothConnectOptions): Promise<BluetoothPuzzle>;
export {};
//# sourceMappingURL=connect.d.ts.map