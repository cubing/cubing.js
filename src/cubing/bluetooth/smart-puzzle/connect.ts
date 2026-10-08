import {
  type BluetoothConnectOptions,
  bluetoothConnect,
} from "../connect/index.ts";
import type { BluetoothPuzzle } from "./bluetooth-puzzle.ts";
import { ganConfig } from "./gan.ts";
import { giiKERConfig } from "./giiker.ts";
import { goCubeConfig } from "./gocube.ts";
import { heykubeConfig } from "./Heykube.ts";
import { qiyiConfig } from "./qiyi.ts";

const smartPuzzleConfigs = [
  ganConfig,
  goCubeConfig,
  heykubeConfig,
  qiyiConfig,
  giiKERConfig, // GiiKER must be last, due to Xiaomi naming. TODO: enforce this using tests.
];

/** @category Smart Puzzles */
export async function connectSmartPuzzle(
  options?: BluetoothConnectOptions,
): Promise<BluetoothPuzzle> {
  return bluetoothConnect<BluetoothPuzzle>(smartPuzzleConfigs, options);
}
