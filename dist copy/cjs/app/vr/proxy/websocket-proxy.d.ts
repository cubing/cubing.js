import { MoveEvent } from "../../../src/bluetooth";
import { OrientationEvent } from "../../../src/bluetooth/bluetooth-puzzle";
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
export declare type ProxyEvent = ProxyMoveEvent | ProxyOrientationEvent | ProxyResetEvent;
export declare class ProxySender {
    private websocket;
    constructor();
    onMove(e: MoveEvent): void;
    onOrientation(e: OrientationEvent): void;
    sendReset(): void;
    private onopen;
    private onerror;
    private onmessage;
    private sendEvent;
}
export declare class ProxyReceiver {
    private callback;
    private websocket;
    constructor(callback: (e: ProxyEvent) => void);
    private onopen;
    private onerror;
    private onmessage;
}
//# sourceMappingURL=websocket-proxy.d.ts.map