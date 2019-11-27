// TODO: Generalize to WebRTC setup.

import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import { ProxySender } from "./websocket-proxy";

// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.
import { BluetoothPuzzle, connect, debugKeyboardConnect } from "../../../src/bluetooth/index";
import { GoCube } from "../../../src/bluetooth/index";

class App {
  private proxySender = new ProxySender();
  // private debugProxyReceiver = new ProxyReceiver();
  private puzzle: BluetoothPuzzle;
  constructor() {
    document.querySelector("#connect-bluetooth").addEventListener("click", async () => {
      this.puzzle = await connect();
      this.puzzle.addMoveListener(this.proxySender.onMove.bind(this.proxySender));
      this.puzzle.addOrientationListener(this.proxySender.onOrientation.bind(this.proxySender));
      console.log("Puzzle connected!", this.puzzle);
    });

    document.querySelector("#connect-keyboard").addEventListener("click", async () => {
      this.puzzle = await debugKeyboardConnect();
      this.puzzle.addMoveListener(this.proxySender.onMove.bind(this.proxySender));
      console.log("Keyboard connected!", this.puzzle);
    });

    document.querySelector("#reset").addEventListener("click", async () => {
      this.proxySender.sendReset();
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
