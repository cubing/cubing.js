// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.
import { algToString, invert, parse, Sequence } from "../../cubing/alg/index";
import { OrientationEvent } from "../../cubing/bluetooth/bluetooth-puzzle";
import {
  BluetoothPuzzle,
  connect,
  debugKeyboardConnect,
  MoveEvent,
} from "../../cubing/bluetooth/index";
import { TwistyPlayer } from "../../cubing/twisty/index";

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

console.log(algToString(invert(parse("R U R' F D"))));
window.addEventListener("load", async () => {
  const twistyPlayer = new TwistyPlayer({ alg: new Sequence([]) });
  document.body.appendChild(twistyPlayer);

  asyncSetup(twistyPlayer);

  // latestMove: BlockMove;
  // timeStamp: number;
  // debug?: object;
  // state?: PuzzleState;
  // quaternion?: any;
  document.querySelector("#connect")?.addEventListener("click", async () => {
    const acceptAllDevices = (document.querySelector(
      "#acceptAllDevices",
    ) as HTMLInputElement).checked;
    window.puzzle = await connect({ acceptAllDevices });
    window.puzzle.addMoveListener((e: MoveEvent) => {
      twistyPlayer.experimentalAddMove(e.latestMove);
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
