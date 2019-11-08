// TODO: Generalize to WebRTC setup.

import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import { ProxySender } from "./websocket-proxy";

import { BluetoothPuzzle, connect, debugKeyboardConnect } from "../../../src/bluetooth";

class App {
  private proxySender = new ProxySender();
  // private debugProxyReceiver = new ProxyReceiver();
  private puzzle: BluetoothPuzzle;
  constructor() {
    document.querySelector("#connect-bluetooth").addEventListener("click", async () => {
      this.puzzle = await connect();
      this.puzzle.addMoveListener(this.proxySender.onMove.bind(this.proxySender));
      console.log("Puzzle connected!", this.puzzle);
    });

    document.querySelector("#connect-keyboard").addEventListener("click", async () => {
      this.puzzle = await debugKeyboardConnect();
      this.puzzle.addMoveListener(this.proxySender.onMove.bind(this.proxySender));
      console.log("Keyboard connected!", this.puzzle);
    });

    document.querySelector("#reset").addEventListener("click", async () => {
      this.proxySender.sendReset();
    });
  }

}

window.addEventListener("load", () => {
  const app = new App();
  (window as any).app = app;
});
