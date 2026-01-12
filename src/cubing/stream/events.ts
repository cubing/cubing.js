// TODO: Use actual `CustomEvent`s?
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent

import type { AlgLeaf } from "../alg";
import type { KPattern } from "../kpuzzle";

/** @category Smart Puzzles */
export interface AlgLeafEvent {
  latestAlgLeaf: AlgLeaf;
  timeStamp: number;
  debug?: Record<string, unknown>;
  pattern?: KPattern;
  quaternion?: any; // TODO: Unused
}

// TODO: Only use the `quaternion` field in the `AlgLeafEvent`?
/** @category Smart Puzzles */
export interface OrientationEvent {
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  timeStamp: number;
  debug?: Record<string, unknown>;
}

export interface ProxyMoveEvent {
  event: "move";
  data: AlgLeafEvent;
}
export interface ProxyOrientationEvent {
  event: "orientation";
  data: OrientationEvent;
}
export interface ProxyResetEvent {
  event: "reset";
}
export type ProxyEvent =
  | ProxyMoveEvent
  | ProxyOrientationEvent
  | ProxyResetEvent;
