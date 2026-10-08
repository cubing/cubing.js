import {
  type BluetoothConnectOptions,
  bluetoothConnect,
} from "../connect/index.ts";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle.ts";
import { type GanTimer, ganTimerConfig } from "./GanTimer.ts";

/** @category Timers */
export type BluetoothTimer = GanTimer; // TODO

const smartTimerConfigs: BluetoothConfig<BluetoothTimer>[] = [ganTimerConfig];

/** @category Timers */
export async function connectSmartTimer(
  options?: BluetoothConnectOptions,
): Promise<BluetoothTimer> {
  return bluetoothConnect<BluetoothTimer>(smartTimerConfigs, options);
}
