// TODO: Generalize to WebRTC setup.

import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import { WebSocketProxySender } from "../../../src/stream/websocket-proxy";

// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.
import {
  BluetoothPuzzle,
  connect,
  debugKeyboardConnect,
} from "../../../src/bluetooth/index";
import { GoCube } from "../../../src/bluetooth/index";
import { socketOrigin } from "../config";

class App {
  private proxySender: WebSocketProxySender;
  // private debugProxyReceiver = new ProxyReceiver();
  private puzzle: BluetoothPuzzle;
  constructor() {
    if (!socketOrigin) {
      throw new Error("Must specify socket origin in the URL.");
    }
    const url = new URL(socketOrigin);
    url.pathname = "/register-sender";
    this.proxySender = new WebSocketProxySender(url.toString());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document
      .querySelector("#connect-bluetooth")!
      .addEventListener("click", async () => {
        this.puzzle = await connect();
        this.puzzle.addMoveListener(
          this.proxySender.onMove.bind(this.proxySender),
        );
        this.puzzle.addOrientationListener(
          this.proxySender.sendOrientationEvent.bind(this.proxySender),
        );
        console.log("Puzzle connected!", this.puzzle);
      });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document
      .querySelector("#connect-keyboard")!
      .addEventListener("click", async () => {
        this.puzzle = await debugKeyboardConnect();
        this.puzzle.addMoveListener(
          this.proxySender.onMove.bind(this.proxySender),
        );
        console.log("Keyboard connected!", this.puzzle);
      });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.querySelector("#reset")!.addEventListener("click", async () => {
      this.proxySender.sendResetEvent();
      if ("reset" in this.puzzle) {
        (this.puzzle as GoCube).reset();
      }
    });
  }
}

window.addEventListener("load", () => {
  const app = new App();
  (window as any).app = app;
});
