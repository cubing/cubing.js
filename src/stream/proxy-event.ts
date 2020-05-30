import { MoveEvent } from "../bluetooth";
import { OrientationEvent } from "../bluetooth/bluetooth-puzzle";
export interface ProxyMoveEvent {
  event: "move";
  data: MoveEvent;
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
