// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.

import { Alg } from "../../../cubing/alg/index";
import type { OrientationEvent } from "../../../cubing/bluetooth/index";
import {
  BluetoothPuzzle,
  connectSmartPuzzle,
  debugKeyboardConnect,
  MoveEvent,
} from "../../../cubing/bluetooth/index";
import { TwistyAlgViewer, TwistyPlayer } from "../../../cubing/twisty/index";

// experimentalShowJumpingFlash(false); // TODO

async function asyncSetup(twistyPlayer: TwistyPlayer): Promise<void> {
  console.log("asyncSetup");
  const keyboard = await debugKeyboardConnect(twistyPlayer); // TODO: attach to viewer only?
  console.log("keyboard", twistyPlayer, keyboard);
  keyboard.addMoveListener((e: MoveEvent) => {
    console.log("listener", e);
    twistyPlayer.experimentalAddMove(e.latestMove);
  });
}

declare global {
  interface Window {
    puzzle: BluetoothPuzzle | null;
  }
}

window.puzzle = null;

window.addEventListener("load", async () => {
  const twistyPlayer = new TwistyPlayer({
    alg: new Alg(),
    // controlPanel: "none",
    // background: "none",
  });
  document.querySelector("#player")!.appendChild(twistyPlayer);
  document
    .querySelector("#controls")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer }));

  asyncSetup(twistyPlayer);

  // latestMove: BlockMove;
  // timeStamp: number;
  // debug?: object;
  // state?: PuzzleState;
  // quaternion?: any;

  const connectButton = document.querySelector("#connect") as HTMLButtonElement;

  connectButton.addEventListener("click", async () => {
    // const acceptAllDevices = (document.querySelector(
    //   "#acceptAllDevices",
    // ) as HTMLInputElement).checked;
    const puzzle = await connectSmartPuzzle();
    window.puzzle = puzzle;
    try {
      const state = await puzzle.getState();
      twistyPlayer.experimentalSetStartStateOverride(state);
      twistyPlayer.alg = new Alg();
    } catch (e) {
      console.error("Unable to get initial state", e);
    }
    connectButton.textContent = `Connected: ${puzzle.name()}`;
    connectButton.disabled = true;

    puzzle.addMoveListener((e: MoveEvent) => {
      twistyPlayer.experimentalAddMove(e.latestMove);
    });

    const resetButton = document.querySelector(
      "#player-state-reset",
    ) as HTMLButtonElement;
    resetButton.addEventListener("click", () => {
      twistyPlayer.experimentalSetStartStateOverride(null);
      twistyPlayer.alg = new Alg();
    });
    resetButton.disabled = false;

    const cubeStateButton = document.querySelector(
      "#player-state-read",
    ) as HTMLButtonElement;
    cubeStateButton.addEventListener("click", async () => {
      twistyPlayer.experimentalSetStartStateOverride(await puzzle.getState());
      twistyPlayer.alg = new Alg();
    });
    cubeStateButton.disabled = false;

    puzzle.addOrientationListener((_e: OrientationEvent) => {
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
