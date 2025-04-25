import { type BluetoothConnectOptions, bluetoothConnect } from "../connect";
import type { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";
import { type GanRobot, ganTimerConfig } from "./GanRobot";

/** @category Robots */
export type BluetoothRobot = GanRobot; // TODO

const smartRobotConfigs: BluetoothConfig<BluetoothRobot>[] = [ganTimerConfig];

/** @category Robots */
export async function connectSmartRobot(
  options?: BluetoothConnectOptions,
): Promise<BluetoothRobot> {
  return bluetoothConnect<BluetoothRobot>(smartRobotConfigs, options);
}
