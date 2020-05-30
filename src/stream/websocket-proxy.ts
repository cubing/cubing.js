import { MoveEvent } from "../bluetooth";
import { OrientationEvent } from "../bluetooth/bluetooth-puzzle";
import { socketOrigin } from "../../app/vr/config";
import { ProxyEvent } from "./proxy-event";

export class WebSocketProxySender {
  protected websocket: WebSocket;
  constructor(url: string) {
    this.websocket = new WebSocket(url);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }

  public onMove(e: MoveEvent): void {
    this.sendMoveEvent({
      event: "move",
      data: e,
    });
  }

  public sendOrientationEvent(e: OrientationEvent): void {
    this.sendMoveEvent({
      event: "orientation",
      data: e,
    });
  }

  public sendResetEvent(): void {
    this.sendMoveEvent({ event: "reset" });
  }

  protected sendMoveEvent(proxyEvent: ProxyEvent): void {
    console.log(proxyEvent);
    this.websocket.send(JSON.stringify(proxyEvent));
  }

  protected onopen(): void {
    console.log("Sending socket is open!");
  }

  protected onerror(error: Error): void {
    console.error("WebSocket sender error:", error);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
  protected onmessage(e: MessageEvent): void {}
}

export abstract class WebSocketProxyReceiver {
  protected websocket: WebSocket;
  constructor(url: string) {
    if (!socketOrigin) {
      console.log("No socket origin specified. Will not attempt to connect.");
      return;
    }
    this.websocket = new WebSocket(url);
    console.log(this.websocket);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }

  protected onopen(): void {
    console.log("Receiving socket is open!");
  }

  protected onerror(error: Error): void {
    console.error("WebSocket receiver error:", error);
  }

  protected onmessage(e: MessageEvent): void {
    this.onProxyEvent(JSON.parse(e.data));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  abstract onProxyEvent(e: MoveEvent): void;
}
