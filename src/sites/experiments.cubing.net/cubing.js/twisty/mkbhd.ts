import { Alg } from "../../../../cubing/alg";
import {
  connectSmartPuzzle,
  debugKeyboardConnect,
  MoveEvent,
} from "../../../../cubing/bluetooth";
import "../../../../cubing/twisty";
import type { TwistyPlayer } from "../../../../cubing/twisty";
import { setGlobalPixelRatioOverride } from "../../../../cubing/twisty/old/dom/viewers/canvas";

const pixelRatio = new URL(location.href).searchParams.get("pixelRatio");
if (pixelRatio !== null) {
  setGlobalPixelRatioOverride(parseFloat(pixelRatio));
}

const mkbhdHintSpriteURL = new URL(
  "./mkbhd-sprite-red-hint.png",
  import.meta.url,
).toString();
const mkbhdSpriteURL = new URL(
  "./mkbhd-sprite-red.png",
  import.meta.url,
).toString();

const spriteURL =
  new URL(location.href).searchParams.get("sprite") ?? mkbhdSpriteURL;

const hintSpriteURL =
  new URL(location.href).searchParams.get("hint-sprite") ?? mkbhdHintSpriteURL;

// const foundationOpacity = parseFloat(
//   new URL(location.href).searchParams.get("foundation-opacity") ?? "1",
// );

// Common picture cube demo code.

let haveHadMoveInput = false;

const twistyPlayer = document.querySelector("twisty-player")! as TwistyPlayer;
twistyPlayer.experimentalSprite = spriteURL;
twistyPlayer.experimentalHintSprite = hintSpriteURL;

// twistyPlayer.experimentalSetCursorIndexer("simultaneous");
// twistyPlayer.timeline.jumpToStart();
const tempo = new URL(location.href).searchParams.get("tempo");
if (tempo !== null) {
  twistyPlayer.tempoScale = parseFloat(tempo);
}

// setTimeout(() => {
//   (twistyPlayer.twisty3D as Cube3D).experimentalSetFoundationOpacity(
//     foundationOpacity,
//   );
//   twistyPlayer.timeline.play(); // TODO: add autoplay
// }, 1000);
// twistyPlayer.timeline.addActionListener({
//   onTimelineAction: (actionEvent: TimelineActionEvent) => {
//     if (haveHadMoveInput) {
//       return;
//     }
//     if (actionEvent.locationType === TimestampLocationType.EndOfTimeline) {
//       twistyPlayer.timeline.jumpToStart();
//       twistyPlayer.timeline.play();
//     }
//   },
// });
function play(): void {
  twistyPlayer.experimentalModel.playingInfoProp.set({
    playing: true,
    loop: true,
  });
}
play();

(async () => {
  const kb = await debugKeyboardConnect();
  kb.addMoveListener((e: MoveEvent) => {
    if (!haveHadMoveInput) {
      // twistyPlayer.timeline.pause();
      twistyPlayer.alg = new Alg();
      haveHadMoveInput = true;
    }
    twistyPlayer.experimentalAddMove(e.latestMove);
    play();
  });
})();

let lastTimestamp = performance.now();
const CAM_ROTATION_DEG_PER_SEC = -24;

let rotating = true;
twistyPlayer.addEventListener("click", () => {
  rotating = false;
});

function rotate(timestamp: number): void {
  if (!rotating) {
    return;
  }
  requestAnimationFrame(rotate);
  const delta_deg =
    ((timestamp - lastTimestamp) / 1000) * CAM_ROTATION_DEG_PER_SEC;
  lastTimestamp = timestamp;
  twistyPlayer.experimentalModel.orbitCoordinatesRequestProp.set(
    (async () => {
      const { longitude } =
        await twistyPlayer.experimentalModel.orbitCoordinatesProp.get();
      return { longitude: longitude + delta_deg };
    })(),
  );
}
requestAnimationFrame(rotate);

async function connectBluetooth(): Promise<void> {
  const bluetoothPuzzle = await connectSmartPuzzle();
  document.body.removeEventListener("click", connectBluetooth);
  bluetoothPuzzle.addMoveListener((e: MoveEvent) => {
    if (!haveHadMoveInput) {
      // twistyPlayer.timeline.pause();
      twistyPlayer.alg = new Alg("");
      haveHadMoveInput = true;
    }
    twistyPlayer.experimentalAddMove(e.latestMove);
    play();
  });
}
if (new URL(location.href).searchParams.get("bluetooth") === "true") {
  document.body.addEventListener("click", connectBluetooth);
}
