import { Alg } from "../../../cubing/alg";
import type { OrientationEvent } from "../../../cubing/bluetooth";
import {
  connectSmartPuzzle,
  debugKeyboardConnect,
  MoveEvent,
} from "../../../cubing/bluetooth";
import { TwistyAlgViewer, TwistyPlayer } from "../../../cubing/twisty";

async function asyncSetup(twistyPlayer: TwistyPlayer): Promise<void> {
  console.log("asyncSetup");
  const keyboard = await debugKeyboardConnect(twistyPlayer); // TODO: attach to viewer only?
  console.log("keyboard", twistyPlayer, keyboard);
  keyboard.addMoveListener((e: MoveEvent) => {
    console.log("listener", e);
    twistyPlayer.experimentalAddMove(e.latestMove);
  });
}

(globalThis as any).puzzle = null;

window.addEventListener("DOMContentLoaded", async () => {
  const twistyPlayer = new TwistyPlayer({
    alg: new Alg(),
  });
  document.querySelector("#player")!.appendChild(twistyPlayer);
  document
    .querySelector("#controls")!
    .appendChild(new TwistyAlgViewer({ twistyPlayer }));

  asyncSetup(twistyPlayer);

  const connectButton = document.querySelector("#connect") as HTMLButtonElement;
  connectButton.addEventListener("click", async () => {
    // const acceptAllDevices = (document.querySelector(
    //   "#acceptAllDevices",
    // ) as HTMLInputElement).checked;
    const puzzle = await connectSmartPuzzle();
    (globalThis as any).puzzle = puzzle;
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
      try {
        twistyPlayer.experimentalSetStartStateOverride(await puzzle.getState());
      } catch (e) {
        twistyPlayer.experimentalSetStartStateOverride(null);
      }
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
