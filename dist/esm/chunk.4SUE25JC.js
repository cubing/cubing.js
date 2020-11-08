// src/stream/websocket-proxy.ts
class WebSocketProxySender {
  constructor(url) {
    this.websocket = new WebSocket(url);
    this.websocket.onopen = this.onopen.bind(this);
    this.websocket.onerror = this.onerror.bind(this);
    this.websocket.onmessage = this.onmessage.bind(this);
  }
  sendMoveEvent(e) {
    this.sendProxyEvent({
      event: "move",
      data: e
    });
  }
  sendOrientationEvent(e) {
    this.sendProxyEvent({
      event: "orientation",
      data: e
    });
  }
  sendResetEvent() {
    this.sendProxyEvent({event: "reset"});
  }
  sendProxyEvent(proxyEvent) {
    this.websocket.send(JSON.stringify(proxyEvent));
  }
  onopen() {
    console.log("Sending socket is open!");
  }
  onerror(error) {
    console.error("WebSocket sender error:", error);
  }
  onmessage(e) {
  }
}
class WebSocketProxyReceiver {
  constructor(url, socketOrigin) {
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
  onopen() {
    console.log("Receiving socket is open!");
  }
  onerror(error) {
    console.error("WebSocket receiver error:", error);
  }
  onmessage(e) {
    this.onProxyEvent(JSON.parse(e.data));
  }
}

export {
  WebSocketProxySender,
  WebSocketProxyReceiver
};
//# sourceMappingURL=chunk.LRX4Z3NO.js.map
