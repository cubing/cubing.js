/// <reference types="web-bluetooth" />

// TODO: deprecate these exports?
export type {
  ExperimentalAlgLeafEvent as MoveEvent,
  ExperimentalOrientationEvent as OrientationEvent,
} from "../stream/index.ts";
export { enableDebugLogging } from "./debug.ts";
export { debugKeyboardConnect, KeyboardPuzzle } from "./keyboard.ts";
export type { BluetoothPuzzle } from "./smart-puzzle/bluetooth-puzzle.ts";
export { connectSmartPuzzle } from "./smart-puzzle/connect.ts";
export { GanCube } from "./smart-puzzle/gan.ts";
export { GiiKERCube } from "./smart-puzzle/giiker.ts";
export { GoCube } from "./smart-puzzle/gocube.ts";
export type { BluetoothRobot } from "./smart-robot/index.ts";
export { connectSmartRobot } from "./smart-robot/index.ts";
export type { BluetoothTimer } from "./smart-timer/index.ts";
export { connectSmartTimer } from "./smart-timer/index.ts";
