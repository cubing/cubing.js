import {
  type BluetoothConnectOptions,
  bluetoothConnect,
} from "../connect/index.ts";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle.ts";
import { type GanRobot, ganTimerConfig } from "./GanRobot.ts";

/** @category Robots */
export type BluetoothRobot = GanRobot; // TODO

const smartRobotConfigs: BluetoothConfig<BluetoothRobot>[] = [ganTimerConfig];

/** @category Robots */
export async function connectSmartRobot(
  options?: BluetoothConnectOptions,
): Promise<BluetoothRobot> {
  return bluetoothConnect<BluetoothRobot>(smartRobotConfigs, options);
}
