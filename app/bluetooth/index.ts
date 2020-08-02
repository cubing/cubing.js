import "babel-polyfill"; // Prevent `regeneratorRuntime is not defined` error. https://github.com/babel/babel/issues/5085
import { Quaternion } from "three";
// Import index files from source.
// This allows Parcel to be faster while only using values exported in the final distribution.
import { algToString, invert, parse, Sequence } from "../../src/alg/index";
import { OrientationEvent } from "../../src/bluetooth/bluetooth-puzzle";
import {
  BluetoothPuzzle,
  connect,
  debugKeyboardConnect,
  MoveEvent,
} from "../../src/bluetooth/index";
import {
  experimentalShowJumpingFlash,
  TwistyPlayerOld,
} from "../../src/twisty/index";

experimentalShowJumpingFlash(false);

async function asyncSetup(twistyPlayerOld: TwistyPlayerOld): Promise<void> {
  console.log("asyncSetup");
  const keyboard = await debugKeyboardConnect(
    twistyPlayerOld.experimentalGetPlayer().cube3DView.element,
  );
  console.log("keyboard", twistyPlayerOld, keyboard);
  keyboard.addMoveListener((e: MoveEvent) => {
    console.log("listener", e);
    twistyPlayerOld.experimentalAddMove(e.latestMove);
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
  const twistyPlayerOld = new TwistyPlayerOld({ alg: new Sequence([]) });
  document.body.appendChild(twistyPlayerOld);

  asyncSetup(twistyPlayerOld);

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
      twistyPlayerOld.experimentalAddMove(e.latestMove);
    });
    window.puzzle.addOrientationListener((e: OrientationEvent) => {
      const { x, y, z, w } = e.quaternion;
      twistyPlayerOld
        .experimentalGetPlayer()
        .cube3DView.experimentalGetCube3D()
        .experimentalGetCube()
        .quaternion.copy(new Quaternion(x, y, z, w));
      twistyPlayerOld
        .experimentalGetAnim()
        .experimentalGetScheduler()
        .singleFrame();
    });
  });
});
