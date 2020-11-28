import { parseAlg } from "../../cubing/alg";
import {
  connect,
  debugKeyboardConnect,
  MoveEvent,
} from "../../cubing/bluetooth";
import {
  Cube3D,
  TimelineActionEvent,
  TimestampLocationType,
  TwistyPlayer,
} from "../../cubing/twisty";

// Parcel-ism.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mkbhdSpriteURL from "url:./mkbhd-sprite-red.png";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import m12Cube from "url:./M12Cube.gif";

(window as any).m12Cube = m12Cube;

const spriteURL =
  new URL(location.href).searchParams.get("sprite") ?? mkbhdSpriteURL;

let haveHadMoveInput = false;

const twistyPlayer = document.querySelector("twisty-player")! as TwistyPlayer;
twistyPlayer.timeline.play(); // TODO: add autoplay
twistyPlayer.controls = "none";
twistyPlayer.timeline.addActionListener({
  onTimelineAction: (actionEvent: TimelineActionEvent) => {
    if (haveHadMoveInput) {
      return;
    }
    if (actionEvent.locationType === TimestampLocationType.EndOfTimeline)
      twistyPlayer.timeline.jumpToStart();
    twistyPlayer.timeline.play();
  },
});

(async () => {
  const kb = await debugKeyboardConnect();
  kb.addMoveListener((e: MoveEvent) => {
    if (!haveHadMoveInput) {
      twistyPlayer.timeline.pause();
      twistyPlayer.alg = parseAlg("");
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
  const bluetoothPuzzle = await connect();
  document.body.removeEventListener("click", connectBluetooth);
  bluetoothPuzzle.addMoveListener((e: MoveEvent) => {
    if (!haveHadMoveInput) {
      twistyPlayer.timeline.pause();
      twistyPlayer.alg = parseAlg("");
      haveHadMoveInput = true;
    }
    twistyPlayer.experimentalAddMove(e.latestMove);
  });
}
if (new URL(location.href).searchParams.get("bluetooth") === "true") {
  document.body.addEventListener("click", connectBluetooth);
}
