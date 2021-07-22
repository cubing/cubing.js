import { WebSocketProxyReceiver, ProxyEvent } from "../../../../cubing/stream";

export class CallbackProxyReceiver extends WebSocketProxyReceiver {
  constructor(url: string, private callback: (e: ProxyEvent) => void) {
    super(url, url);
  }

  onProxyEvent(e: ProxyEvent): void {
    this.callback(e);
  }
}
