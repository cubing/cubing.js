// TODO: deprecate these exports?
export type {
  ExperimentalAlgLeafEvent as MoveEvent,
  ExperimentalOrientationEvent as OrientationEvent,
} from "../stream";
export { enableDebugLogging } from "./debug";
export { debugKeyboardConnect, KeyboardPuzzle } from "./keyboard";
export type { BluetoothPuzzle } from "./smart-puzzle/bluetooth-puzzle";
export { connectSmartPuzzle } from "./smart-puzzle/connect";
export { GanCube } from "./smart-puzzle/gan";
export { GiiKERCube } from "./smart-puzzle/giiker";
export { GoCube } from "./smart-puzzle/gocube";
export type { BluetoothRobot } from "./smart-robot";
export { connectSmartRobot } from "./smart-robot";
export type { BluetoothTimer } from "./smart-timer";
export { connectSmartTimer } from "./smart-timer";
