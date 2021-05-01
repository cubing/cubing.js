// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import m12Cube from "url:./M12Cube.gif";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import supercubeSprite from "url:./supercube-sprite.png";
// Parcel-ism.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mkbhdSpriteURL from "url:./mkbhd-sprite-red.png";
import { Alg } from "../../../cubing/alg";
import {
  connectSmartPuzzle,
  debugKeyboardConnect,
  MoveEvent,
} from "../../../cubing/bluetooth";
import {
  Cube3D,
  TimelineActionEvent,
  TimestampLocationType,
  TwistyPlayer,
} from "../../../cubing/twisty";

(window as any).m12Cube = m12Cube;

const spriteURL =
  new URL(location.href).searchParams.get("sprite") ?? supercubeSprite;

const hintSpriteURL =
  new URL(location.href).searchParams.get("hint-sprite") ?? "";

// Common picture cube demo code.

let haveHadMoveInput = false;

const twistyPlayer = document.querySelector("twisty-player")! as TwistyPlayer;
twistyPlayer.experimentalSetCursorIndexer("simultaneous");
twistyPlayer.timeline.jumpToStart();
setTimeout(() => {
  twistyPlayer.timeline.play(); // TODO: add autoplay
}, 1000);
twistyPlayer.timeline.addActionListener({
  onTimelineAction: (actionEvent: TimelineActionEvent) => {
    if (haveHadMoveInput) {
      return;
    }
    if (actionEvent.locationType === TimestampLocationType.EndOfTimeline) {
      twistyPlayer.timeline.jumpToStart();
      twistyPlayer.timeline.play();
    }
  },
});

(async () => {
  const kb = await debugKeyboardConnect();
  kb.addMoveListener((e: MoveEvent) => {
    if (!haveHadMoveInput) {
      twistyPlayer.timeline.pause();
      twistyPlayer.alg = new Alg();
      haveHadMoveInput = true;
    }
    twistyPlayer.experimentalAddMove(e.latestMove);
  });
})();

let lastTimestamp = performance.now();
const ROTATION_RATE = (2 * Math.PI) / 15;
let haveTriedToSetSpriteURL = false;
function rotate() {
  if (twistyPlayer.twisty3D && !haveTriedToSetSpriteURL) {
    haveTriedToSetSpriteURL = true;
    (twistyPlayer.twisty3D as Cube3D).experimentalSetStickerSpriteURL(
      spriteURL,
    );
    (twistyPlayer.twisty3D as Cube3D).experimentalSetHintStickerSpriteURL(
      hintSpriteURL,
    );
  }

  const newTimestamp = performance.now();
  twistyPlayer.twisty3D?.rotateY(
    ((newTimestamp - lastTimestamp) / 1000) * ROTATION_RATE,
  );
  if (
    !(twistyPlayer.viewerElems[0] as any)?.orbitControls
      .experimentalHasBeenMoved
  ) {
    requestAnimationFrame(rotate);
    lastTimestamp = newTimestamp;
  }
}
requestAnimationFrame(rotate);

async function connectBluetooth(): Promise<void> {
  const bluetoothPuzzle = await connectSmartPuzzle();
  document.body.removeEventListener("click", connectBluetooth);
  bluetoothPuzzle.addMoveListener((e: MoveEvent) => {
    if (!haveHadMoveInput) {
      twistyPlayer.timeline.pause();
      twistyPlayer.alg = new Alg("");
      haveHadMoveInput = true;
    }
    twistyPlayer.experimentalAddMove(e.latestMove);
  });
}
if (new URL(location.href).searchParams.get("bluetooth") === "true") {
  document.body.addEventListener("click", connectBluetooth);
}
