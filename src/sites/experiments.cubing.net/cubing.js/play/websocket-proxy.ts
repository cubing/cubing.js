import {
  type ExperimentalProxyEvent,
  ExperimentalWebSocketProxyReceiver,
} from "../../../../cubing/stream/index.ts";

export class CallbackProxyReceiver extends ExperimentalWebSocketProxyReceiver {
  private callback: (e: ExperimentalProxyEvent) => void; // Moved automatically for erasable syntax.

  constructor(url: string, callback: (e: ExperimentalProxyEvent) => void) {
    super(url, url);
    this.callback = callback;
  }

  onProxyEvent(e: ExperimentalProxyEvent): void {
    this.callback(e);
  }
}
