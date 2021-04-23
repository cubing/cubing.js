import { bluetoothConnect, BluetoothConnectOptions } from "../connect";
import { BluetoothConfig } from "../smart-puzzle/bluetooth-puzzle";
import { GanRobot, ganTimerConfig } from "./GanRobot";

type BluetoothRobot = GanRobot; // TODO

const smartRobotConfigs: BluetoothConfig<BluetoothRobot>[] = [ganTimerConfig];

export async function connectSmartRobot(
  options?: BluetoothConnectOptions,
): Promise<BluetoothRobot> {
  return bluetoothConnect<BluetoothRobot>(smartRobotConfigs, options);
}
