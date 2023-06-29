import { bluetoothConnect, type BluetoothConnectOptions } from "../connect";
import type { BluetoothPuzzle } from "./bluetooth-puzzle";
import { ganConfig } from "./gan";
import { gani3Config } from "./gani3";
import { giiKERConfig } from "./giiker";
import { goCubeConfig } from "./gocube";
import { heykubeConfig } from "./Heykube";

const smartPuzzleConfigs = [
  gani3Config,  //  gani3 must be before gan so 'gani3-xxx' is priority over 'gan-xxx'
  ganConfig,
  goCubeConfig,
  heykubeConfig,
  giiKERConfig, // GiiKER must be last, due to Xiaomi naming. TODO: enforce this using tests.
];

/** @category Smart Puzzles */
export async function connectSmartPuzzle(
  options?: BluetoothConnectOptions,
): Promise<BluetoothPuzzle> {
  return bluetoothConnect<BluetoothPuzzle>(smartPuzzleConfigs, options);
}
