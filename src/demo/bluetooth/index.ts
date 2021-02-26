// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.

import { Alg } from "../../cubing/alg";
import { OrientationEvent } from "../../cubing/bluetooth/bluetooth-puzzle";
import {
  BluetoothPuzzle,
  connect,
  debugKeyboardConnect,
  TurnEvent,
} from "../../cubing/bluetooth/index";
import { TwistyPlayer } from "../../cubing/twisty/index";

// experimentalShowJumpingFlash(false); // TODO

async function asyncSetup(twistyPlayer: TwistyPlayer): Promise<void> {
  console.log("asyncSetup");
  const keyboard = await debugKeyboardConnect(twistyPlayer); // TODO: attach to viewer only?
  console.log("keyboard", twistyPlayer, keyboard);
  keyboard.addTurnListener((e: TurnEvent) => {
    console.log("listener", e);
    twistyPlayer.experimentalAddTurn(e.latestTurn);
  });
}

declare global {
  interface Window {
    puzzle: BluetoothPuzzle | null;
  }
}

window.puzzle = null;

window.addEventListener("load", async () => {
  const twistyPlayer = new TwistyPlayer({ alg: new Alg() });
  document.body.appendChild(twistyPlayer);

  asyncSetup(twistyPlayer);

  // latestTurn: BlockTurn;
  // timeStamp: number;
  // debug?: object;
  // state?: PuzzleState;
  // quaternion?: any;
  document.querySelector("#connect")?.addEventListener("click", async () => {
    const acceptAllDevices = (document.querySelector(
      "#acceptAllDevices",
    ) as HTMLInputElement).checked;
    window.puzzle = await connect({ acceptAllDevices });
    window.puzzle.addTurnListener((e: TurnEvent) => {
      twistyPlayer.experimentalAddTurn(e.latestTurn);
    });
    window.puzzle.addOrientationListener((_e: OrientationEvent) => {
      // TODO
      // const { x, y, z, w } = e.quaternion;
      // twistyPlayer
      //   .experimentalGetPlayer()
      //   .cube3DView.experimentalGetCube3D()
      //   .experimentalGetCube()
      //   .quaternion.copy(new Quaternion(x, y, z, w));
      // twistyPlayer
      //   .experimentalGetAnim()
      //   .experimentalGetScheduler()
      //   .singleFrame();
    });
  });
});
