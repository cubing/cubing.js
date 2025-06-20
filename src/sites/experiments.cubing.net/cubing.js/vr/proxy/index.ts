// TODO: Generalize to WebRTC setup.

// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.
import type { GoCube } from "../../../../../cubing/bluetooth";
import {
  type BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
} from "../../../../../cubing/bluetooth";
import { ExperimentalWebSocketProxySender } from "../../../../../cubing/stream";
import { socketOrigin } from "../config";

class App {
  private proxySender: ExperimentalWebSocketProxySender;
  // private debugProxyReceiver = new ProxyReceiver();
  private puzzle?: BluetoothPuzzle;
  constructor() {
    if (!socketOrigin) {
      throw new Error("Must specify socket origin in the URL.");
    }
    const url = new URL(socketOrigin);
    url.pathname = "/register-sender";
    this.proxySender = new ExperimentalWebSocketProxySender(url.toString());
    document
      .querySelector("#connect-bluetooth")!
      .addEventListener("click", async () => {
        this.puzzle = await connectSmartPuzzle();
        this.puzzle.addAlgLeafListener(
          this.proxySender.sendMoveEvent.bind(this.proxySender),
        );
        this.puzzle.addOrientationListener(
          this.proxySender.sendOrientationEvent.bind(this.proxySender),
        );
        console.log("Puzzle connected!", this.puzzle);
      });

    document
      .querySelector("#connect-keyboard")!
      .addEventListener("click", async () => {
        this.puzzle = await debugKeyboardConnect();
        this.puzzle.addAlgLeafListener(
          this.proxySender.sendMoveEvent.bind(this.proxySender),
        );
        console.log("Keyboard connected!", this.puzzle);
      });

    document.querySelector("#reset")!.addEventListener("click", async () => {
      this.proxySender.sendResetEvent();
      if (this.puzzle && "reset" in this.puzzle) {
        (this.puzzle as GoCube)?.reset();
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  (window as any).app = app;
});
