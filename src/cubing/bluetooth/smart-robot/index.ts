import { bluetoothConnect, type BluetoothConnectOptions } from "../connect";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";
import { ganTimerConfig, type GanRobot } from "./GanRobot";

/** @category Robots */
export type BluetoothRobot = GanRobot; // TODO

const smartRobotConfigs: BluetoothConfig<BluetoothRobot>[] = [ganTimerConfig];

/** @category Robots */
export async function connectSmartRobot(
  options?: BluetoothConnectOptions,
): Promise<BluetoothRobot> {
  return bluetoothConnect<BluetoothRobot>(smartRobotConfigs, options);
}
