import { TurnEvent } from "../bluetooth";
import { OrientationEvent } from "../bluetooth/bluetooth-puzzle";
export interface ProxyTurnEvent {
  event: "turn";
  data: TurnEvent;
}
export interface ProxyOrientationEvent {
  event: "orientation";
  data: OrientationEvent;
}
export interface ProxyResetEvent {
  event: "reset";
}
export type ProxyEvent =
  | ProxyTurnEvent
  | ProxyOrientationEvent
  | ProxyResetEvent;
