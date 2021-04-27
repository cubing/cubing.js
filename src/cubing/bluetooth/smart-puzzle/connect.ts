import { bluetoothConnect, BluetoothConnectOptions } from "../connect";
import type { BluetoothPuzzle } from "./bluetooth-puzzle";
import { ganConfig } from "./gan";
import { giiKERConfig } from "./giiker";
import { goCubeConfig } from "./gocube";

const smartPuzzleConfigs = [
  ganConfig,
  goCubeConfig,
  giiKERConfig, // GiiKER must be last, due to Xiaomi naming.
];

export async function connectSmartPuzzle(
  options?: BluetoothConnectOptions,
): Promise<BluetoothPuzzle> {
  return bluetoothConnect<BluetoothPuzzle>(smartPuzzleConfigs, options);
}
