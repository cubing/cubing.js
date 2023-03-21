import { bluetoothConnect, type BluetoothConnectOptions } from "../connect";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";
import { GanTimer, ganTimerConfig } from "./GanTimer";

/** @category Timers */
export type BluetoothTimer = GanTimer; // TODO

const smartTimerConfigs: BluetoothConfig<BluetoothTimer>[] = [ganTimerConfig];

/** @category Timers */
export async function connectSmartTimer(
  options?: BluetoothConnectOptions,
): Promise<BluetoothTimer> {
  return bluetoothConnect<BluetoothTimer>(smartTimerConfigs, options);
}
