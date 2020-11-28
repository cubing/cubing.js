import { parseAlg } from "../../cubing/alg";
import {
  connect,
  debugKeyboardConnect,
  MoveEvent,
} from "../../cubing/bluetooth";
import {
  TimelineActionEvent,
  TimestampLocationType,
  TwistyPlayer,
} from "../../cubing/twisty";

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
function rotate() {
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
