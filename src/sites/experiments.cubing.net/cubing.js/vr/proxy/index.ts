// TODO: Generalize to WebRTC setup.

import { ExperimentalWebSocketProxySender } from "../../../../../cubing/stream";

// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.
import {
  BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
} from "../../../../../cubing/bluetooth";
import type { GoCube } from "../../../../../cubing/bluetooth";
import { socketOrigin } from "../config";

class App {
  private proxySender: ExperimentalWebSocketProxySender;
  // private debugProxyReceiver = new ProxyReceiver();
  private puzzle: BluetoothPuzzle;
  constructor() {
    if (!socketOrigin) {
      throw new Error("Must specify socket origin in the URL.");
    }
    const url = new URL(socketOrigin);
    url.pathname = "/register-sender";
    this.proxySender = new ExperimentalWebSocketProxySender(url.toString());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document
      .querySelector("#connect-bluetooth")!
      .addEventListener("click", async () => {
        this.puzzle = await connectSmartPuzzle();
        this.puzzle.addMoveListener(
          this.proxySender.sendMoveEvent.bind(this.proxySender),
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
          this.proxySender.sendMoveEvent.bind(this.proxySender),
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

window.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  (window as any).app = app;
});
