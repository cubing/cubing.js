import { bluetoothConnect, BluetoothConnectOptions } from "../connect";
import { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";
import { GanTimer, ganTimerConfig } from "./GanTimer";

type BluetoothTimer = GanTimer; // TODO

const smartTimerConfigs: BluetoothConfig<BluetoothTimer>[] = [ganTimerConfig];

export async function connectSmartTimer(
  options?: BluetoothConnectOptions,
): Promise<BluetoothTimer> {
  return bluetoothConnect<BluetoothTimer>(smartTimerConfigs, options);
}
