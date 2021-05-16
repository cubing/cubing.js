import { bluetoothConnect, BluetoothConnectOptions } from "../connect";
import type { BluetoothPuzzle } from "./bluetooth-puzzle";
import { ganConfig } from "./gan";
import { giiKERConfig } from "./giiker";
import { goCubeConfig } from "./gocube";
import { heyKubeConfig } from "./HeyKube";

const smartPuzzleConfigs = [
  ganConfig,
  goCubeConfig,
  heyKubeConfig,
  giiKERConfig, // GiiKER must be last, due to Xiaomi naming. TODO: enforce this using tests.
];

export async function connectSmartPuzzle(
  options?: BluetoothConnectOptions,
): Promise<BluetoothPuzzle> {
  return bluetoothConnect<BluetoothPuzzle>(smartPuzzleConfigs, options);
}
