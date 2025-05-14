import type { MoveEvent, OrientationEvent } from "../bluetooth";
import type { ProxyEvent } from "./proxy-event";

export class WebSocketProxySender {
  protected websocket: WebSocket;
  constructor(url: string) {
    this.websocket = new WebSocket(url);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }

  public sendMoveEvent(e: MoveEvent): void {
    (e as any).latestAlgLeaf = e.latestAlgLeaf.toString(); // TODO
    this.sendProxyEvent({
      event: "move",
      data: e,
    });
  }

  public sendOrientationEvent(e: OrientationEvent): void {
    this.sendProxyEvent({
      event: "orientation",
      data: e,
    });
  }

  public sendResetEvent(): void {
    this.sendProxyEvent({ event: "reset" });
  }

  protected sendProxyEvent(proxyEvent: ProxyEvent): void {
    this.websocket.send(JSON.stringify(proxyEvent));
  }

  protected onopen(): void {
    console.log("Sending socket is open!");
  }

  protected onerror(error: any): void {
    console.error("WebSocket sender error:", error);
  }

  protected onmessage(_e: MessageEvent): void {}
}

export abstract class WebSocketProxyReceiver {
  protected websocket?: WebSocket;
  constructor(url: string, socketOrigin?: string) {
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

  protected onerror(error: any): void {
    console.error("WebSocket receiver error:", error);
  }

  protected onmessage(e: MessageEvent): void {
    this.onProxyEvent(JSON.parse(e.data));
  }

  abstract onProxyEvent(e: ProxyEvent): void;
}
