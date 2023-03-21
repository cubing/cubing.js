import {
  type ExperimentalProxyEvent,
  ExperimentalWebSocketProxyReceiver,
} from "../../../../cubing/stream";

export class CallbackProxyReceiver extends ExperimentalWebSocketProxyReceiver {
  constructor(
    url: string,
    private callback: (e: ExperimentalProxyEvent) => void,
  ) {
    super(url, url);
  }

  onProxyEvent(e: ExperimentalProxyEvent): void {
    this.callback(e);
  }
}
