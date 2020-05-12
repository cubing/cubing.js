import { MoveEvent } from "../../../src/bluetooth";
import { OrientationEvent } from "../../../src/bluetooth/bluetooth-puzzle";
import { socketOrigin } from "../config";

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

export class ProxySender {
  private websocket: WebSocket;
  constructor() {
    if (!socketOrigin) {
      throw new Error("Must specify socket origin in the URL.");
    }
    const url = new URL(socketOrigin);
    url.pathname = "/register-sender";
    this.websocket = new WebSocket(url.toString());
    console.log(this.websocket);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }

  public onMove(e: MoveEvent): void {
    this.sendEvent({
      event: "move",
      data: e,
    });
  }

  public onOrientation(e: OrientationEvent): void {
    this.sendEvent({
      event: "orientation",
      data: e,
    });
  }

  public sendReset(): void {
    this.sendEvent({ event: "reset" });
  }

  private onopen(): void {
    // this.websocket.send("test");
    console.log("Sending socket is open!");
  }

  private onerror(error: Error): void {
    console.error("WebSocket error:", error);
  }

  private onmessage(e: MessageEvent): void {
    console.log("Message:", e.data);
  }

  private sendEvent(proxyEvent: ProxyEvent): void {
    console.log("Sending event:", proxyEvent);
    this.websocket.send(JSON.stringify(proxyEvent));
  }
}

export class ProxyReceiver {
  private websocket: WebSocket;
  constructor(private callback: (e: ProxyEvent) => void) {
    if (!socketOrigin) {
      console.log("No socket origin specified. Will not attempt to connect.");
      return;
    }
    const url = new URL(socketOrigin);
    url.pathname = "/register-receiver";
    this.websocket = new WebSocket(url.toString());
    console.log(this.websocket);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }

  private onopen(): void {
    console.log("Receiving socket is open!");
  }

  private onerror(error: Error): void {
    console.error("WebSocket error:", error);
  }

  private onmessage(e: MessageEvent): void {
    console.log("Message:", e.data);
    this.callback(JSON.parse(e.data));
  }
}
