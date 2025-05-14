import { type BluetoothConnectOptions, bluetoothConnect } from "../connect";
import { heykubeConfig } from "./Heykube";
import type { BluetoothPuzzle } from "./bluetooth-puzzle";
import { ganConfig } from "./gan";
import { giiKERConfig } from "./giiker";
import { goCubeConfig } from "./gocube";

const smartPuzzleConfigs = [
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
